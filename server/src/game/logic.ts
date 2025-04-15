import { AssassinationChoiceEvent, AssassinationEvent, BackToLobbyEvent, GameResultEvent, MissionChoiceEvent, MissionEvent, MissionOutcomeEvent, ReadyEvent, RoleRevealEvent, SetRoleListEvent, StartGameEvent, TeamProposalEvent, TeamVoteChoiceEvent, TeamVoteEvent, UpdateEvent } from "@common/game/events";
import { Alignment, getRoles, minion, Roles, servant } from "@common/game/roles";
import { GameState, Lobby } from "@common/game/state";
import { ASSASSINATION_TIME, MISSION_CHOICE_TIME, TEAM_VOTE_TIME } from "@common/game/timing";
import { ServerEventBroker } from "./events";
import { ServerLobby, WaitingFor } from "./lobby";
import { updatePlayers } from "./sockets";

/**
 * Min number of players to start a game (1 if running locally)
 */
const MIN_PLAYERS: number = (process.env.NODE_ENV == 'development') ? 1 : 5;

/**
 * Handles a player's ready event
 */
function handleReady(lobby: ServerLobby, event: ReadyEvent): void {
    const username = event.origin;
    lobby.setReady(username);
}

/**
 * Handles setting the role list
 */
function handleSetRoleList(lobby: ServerLobby, event: SetRoleListEvent): void {
    // Check that the event is from the host
    if (event.origin !== lobby.host) {
        console.error("Received set_role_list event from non-host:", event.origin);
        return;
    }

    // Check that the lobby is in the correct state
    if (lobby.state.state !== GameState.LOBBY) {
        console.error("Received set_role_list event in invalid state:", lobby.state.state);
        return;
    }

    // Remove the default servant/minion roles if included (shouldn't count these in the role set)
    const roles = event.roles & ~Roles.SERVANT_OF_ARTHUR & ~Roles.MINION_OF_MORDRED;

    // Check that the roles are valid
    if (Lobby.isValidRoleset(roles, lobby.getPlayerCount())) {
        // If so, update the lobby with the new roleset
        lobby.enabledRoles = roles;
    }

    // If the roleset was invalid, still resend the old roleset to ensure host doesn't get desynced
    lobby.send(new UpdateEvent()
        .setEnabledRoles(lobby.enabledRoles));
}

function handleStartGame(lobby: ServerLobby, event: StartGameEvent): void {
    // Check that the event is from the host
    if (event.origin !== lobby.host) {
        console.error("Received start_game event from non-host:", event.origin);
        // Send an update to make sure clients know they're in the lobby still
        lobby.send(new UpdateEvent()
            .setState(lobby.state));
        return;
    }

    // Check that the lobby is in the correct state
    if (lobby.state.state !== GameState.LOBBY) {
        console.error("Received start_game event in invalid state:", lobby.state.state);
        // Send an update to make sure clients know they're in the lobby still
        lobby.send(new UpdateEvent()
            .setState(lobby.state));
        return;
    }

    // Check that there are enough players to start
    if (lobby.getPlayerCount() < MIN_PLAYERS) {
        console.error("Received start_game event with too few players:", lobby.getPlayerCount());
        // Send an update to make sure clients know they're in the lobby still
        lobby.send(new UpdateEvent()
            .setState(lobby.state));
        return;
    }

    // Shuffle the player order
    lobby.playerOrder = lobby.getPlayers().map(player => player.username);
    lobby.playerOrder.sort(() => Math.random() - 0.5);

    // Set the first leader
    lobby.setLeader(lobby.playerOrder[0]);

    // Update the state
    lobby.state = {
        state: GameState.IN_GAME,
        round: 0,
        outcomes: [-1, -1, -1, -1, -1],
        team: [],
    };

    // Get roleset
    const roles = getRoles(lobby.enabledRoles);

    // Add minions if not enough special evil roles
    const num_evil = roles.filter(role => role.alignment === Alignment.EVIL).length;
    for (let i = num_evil; i < lobby.getEvilPlayerCount(); i++) {
        roles.push(minion);
    }

    // Add servants if not enough roles
    while (roles.length < lobby.getPlayerCount()) {
        roles.push(servant);
    }

    // Shuffle roles and assign to players
    roles.sort(() => Math.random() - 0.5);
    for (let i = 0; i < roles.length; i++) {
        const username = lobby.playerOrder[i];
        const role = roles[i].role;

        // Assign the role to the player
        lobby.setPlayerRoles(username, role);
    }

    // Send the update
    updatePlayers(lobby, (event: UpdateEvent) => {
        event
            .setState(lobby.state)
            .setLeader(lobby.leader!);
    });

    // Wait until everyone is ready, then send the role reveal event
    lobby.onReady(l => {
        // All players have been updated and responded ready; trigger the role reveal
        l.send(new RoleRevealEvent());

        // At this point, we wait for a team proposal from the leader
    });
}

/**
 * Handles proposing a team
 */
function handleTeamProposal(lobby: ServerLobby, event: TeamProposalEvent): void {
    // Check that the event is from the leader
    if (event.origin !== lobby.leader) {
        console.error("Received team_proposal event from non-leader:", event.origin);
        return;
    }

    // Check that the lobby is in the correct state
    if (lobby.state.state !== GameState.IN_GAME) {
        console.error("Received team_proposal event in invalid state:", lobby.state.state);
        return;
    }

    // Check that the proposal is valid
    if (event.team.length != lobby.getMissionPlayerCount()) {
        console.error("Received team_proposal event with wrong number of players:", event.team.length);
        // TODO: add a general-purpose event for sending an error toast to the client?
        // TODO: e.g. notify that too few players on the team
        return;
    }

    // Check if we're in the middle of a vote
    if (lobby.waitingFor !== WaitingFor.NONE) {
        console.error("Received team_proposal event while waiting for:", lobby.waitingFor);
        return;
    }

    // Update the state
    lobby.state.team = event.team;

    // When players are ready, we'll send the team vote event
    lobby.onReady(l => {
        // All players have been updated and responded ready; trigger the team vote
        lobby.clearVotes();
        lobby.waitingFor = WaitingFor.TEAM_VOTE;
        l.send(new TeamVoteEvent(lobby.state.team));

        // Set a timeout for the vote
        setTimeout(() => handleTeamVote(lobby), TEAM_VOTE_TIME);
    });

    // Send the update
    updatePlayers(lobby, (event: UpdateEvent) => {
        event
            .setState(lobby.state)
            .setLeader(lobby.leader!);
    });
}

/**
 * Handles a single team vote
 */
function handleTeamVoteChoice(lobby: ServerLobby, event: TeamVoteChoiceEvent): void {
    // Ignore if we're not voting
    if (lobby.waitingFor !== WaitingFor.TEAM_VOTE) return;
    lobby.setVote(event.origin, event.vote);
}

/**
 * Handles votes for a team, after a timeout
 */
function handleTeamVote(lobby: ServerLobby): void {
    // Reset the waiting state
    lobby.waitingFor = WaitingFor.NONE;

    // Check if the vote passed
    if (lobby.isVotePassing()) {
        // If so, start the mission with this team
        const team = lobby.state.team;

        // First clear any stale mission choices
        lobby.clearMissionChoices();
        lobby.send(new MissionEvent(team));

        // Wait for the mission results
        setTimeout(() => handleMissionOutcome(lobby), MISSION_CHOICE_TIME);
    } else {
        // If not, reset team proposal and go to the next leader
        lobby.state.team = [];
        lobby.incrementLeader();

        // Send the updated game state
        updatePlayers(lobby, (event: UpdateEvent) => {
            event
                .setState(lobby.state)
                .setLeader(lobby.leader!);
        });
    }

    // Clear the vote map regardless of the outcome
    lobby.clearVotes();
}

/**
 * Handles a single mission pass/fail choice
 */
function handleMissionChoice(lobby: ServerLobby, event: MissionChoiceEvent): void {
    // Ignore if we're not on a mission
    if (lobby.waitingFor !== WaitingFor.MISSION_CHOICES) {
        console.error("Received mission_choice event while not on a mission:", lobby.waitingFor);
        return;
    }

    // Check if the event is from a player on the team
    if (!lobby.state.team.includes(event.origin)) {
        console.error("Received mission_choice event from non-team member:", event.origin);
        return;
    }

    lobby.setMissionChoice(event.origin, event.pass);
}

/**
 * Handles mission choices, after a timeout for pass/fail
 */
function handleMissionOutcome(lobby: ServerLobby): void {
    // Reset the waiting state
    lobby.waitingFor = WaitingFor.NONE;

    // Get outcome and clear the mission choice map
    const outcome = lobby.isMissionPassing();
    const fails = lobby.getNumFails();
    console.log("Number of fails:", fails);
    console.log("Outcome:", outcome);
    lobby.clearMissionChoices();

    // Update the lobby state
    lobby.state.outcomes[lobby.state.round] = fails;

    // Send the updated game state
    updatePlayers(lobby, (event: UpdateEvent) => {
        event
            .setState(lobby.state);
    });

    // Wait for a ready response from all players before sending the outcome
    lobby.onReady(l => {
        // Check if enough rounds have been passed to end the game
        // (triggers either immediate good win or merlin guess, if he's enabled)
        if (lobby.getNumPassedMissions() >= 3) {
            // If merlin is disabled, good players win right away
            if ((lobby.enabledRoles & Roles.MERLIN) === Roles.NONE) {
                lobby.send(GameResultEvent.goodWin());
                return;
            }

            // Otherwise, go to the assassination phase
            lobby.clearMerlinGuesses();
            lobby.send(new AssassinationEvent());

            // Wait for merlin guesses
            setTimeout(() => handleAssassination(lobby), ASSASSINATION_TIME);
            return;
        }

        // If three rounds have failed, evil wins right away
        if (lobby.getNumFailedMissions() >= 3) {
            lobby.send(GameResultEvent.evilWin());
            return;
        }

        // Otherwise, just send the mission outcome
        // Clients will respond with ready and we increment the round + leader
        l.onReady(() => {
            // Increment the round and set the next leader
            lobby.incrementLeader();
            lobby.state.round++;
            lobby.state.team = [];

            lobby.send(new UpdateEvent()
                .setState(lobby.state)
                .setLeader(lobby.leader!));
        });
        // Now send the outcome event
        l.send(new MissionOutcomeEvent(outcome, fails));

        // Afterward play continues as normal
        // (The new leader will eventually select a team to propose)
    });
}

/**
 * Handles a single assassination guess
 */
function handleAssassinationChoice(lobby: ServerLobby, event: AssassinationChoiceEvent): void {
    // Check if we're in the assassination phase
    if (lobby.waitingFor !== WaitingFor.ASSASSINATION_GUESSES) return;

    // Check that the event came from an evil player (only the assassin, if the assassin is enabled)
    if (!lobby.canAssassinateMerlin(event.origin)) {
        console.error("Received assassination_choice event from non-assassinating player:", event.origin);
        return;
    }

    lobby.setMerlinGuess(event.origin, event.guess);
}

/**
 * Handles assassination choices, after a timeout for guesses
 */
function handleAssassination(lobby: ServerLobby): void {
    // Reset the waiting state
    lobby.waitingFor = WaitingFor.NONE;

    // Get a majority assassination vote, if any + clear the guess map
    const assassinated = lobby.getAssassinatedPlayer();
    lobby.clearMerlinGuesses();

    // If there was no assassination, the good guys win!
    if (!assassinated) {
        lobby.send(GameResultEvent.missedMerlin(assassinated));
        return;
    }

    // Check if the assassinated player was Merlin
    const merlin = lobby.getMerlin()!; // assassination doesn't happen if there's no merlin
    if (merlin === assassinated) {
        // Evil wins!
        lobby.send(GameResultEvent.guessedMerlin(merlin));
        return;
    }

    // Otherwise, good players win
    lobby.send(GameResultEvent.missedMerlin(assassinated));
}

function handlebackToLobby(lobby: ServerLobby, event: BackToLobbyEvent): void {
    // Ensure the event came from the host
    if (event.origin !== lobby.host) {
        console.error("Received back_to_lobby event from non-host:", event.origin);
        return;
    }

    // Ensure the lobby is in the correct state
    if (lobby.state.state !== GameState.IN_GAME) {
        console.error("Received back_to_lobby event in invalid state:", lobby.state.state);
        return;
    }

    // Reset parts of the lobby state
    lobby.state = {
        state: GameState.LOBBY,
        round: 0,
        outcomes: [-1, -1, -1, -1, -1],
        team: [],
    };
    lobby.leader = null;
    lobby.clearVotes();
    lobby.clearMissionChoices();
    lobby.clearMerlinGuesses();

    lobby.send(new UpdateEvent()
        .setState(lobby.state)
        .setLeader(lobby.leader!));
}

/**
 * Bootstraps event listeners for primary game logic on the server
 */
export function bootstrapEvents(): void {
    ServerEventBroker.on('ready', handleReady);
    ServerEventBroker.on('set_role_list', handleSetRoleList);
    ServerEventBroker.on('start_game', handleStartGame);
    ServerEventBroker.on("team_proposal", handleTeamProposal);
    ServerEventBroker.on("team_vote_choice", handleTeamVoteChoice);
    ServerEventBroker.on("mission_choice", handleMissionChoice);
    ServerEventBroker.on("assassination_choice", handleAssassinationChoice);
    ServerEventBroker.on("back_to_lobby", handlebackToLobby);
}
