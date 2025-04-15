import { ReadyEvent, RoleRevealEvent, SetRoleListEvent, StartGameEvent, TeamProposalEvent, UpdateEvent } from "@common/game/events";
import { Alignment, getRoles, minion } from "@common/game/roles";
import { GameState, Lobby } from "@common/game/state";
import { ServerEventBroker } from "./events";
import { ServerLobby } from "./lobby";
import { updatePlayers } from "./sockets";

/**
 * Bootstraps event listeners for primary game logic on the server
 */
export function bootstrapEvents(): void {
    ServerEventBroker.on('ready', (lobby: ServerLobby, event: ReadyEvent) => {
        const username = event.origin;
        lobby.setReady(username);
    });

    ServerEventBroker.on('set_role_list', (lobby: ServerLobby, event: SetRoleListEvent) => {
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

        // Check that the roles are valid
        if (Lobby.isValidRoleset(event.roles, lobby.getPlayerCount())) {
            // If so, update the lobby with the new roleset
            lobby.enabledRoles = event.roles;
        }

        // If the roleset was invalid, still resend the old roleset
        // to ensure the host doesn't get desynced
        ServerEventBroker
            .getInstance()
            .sendTo(lobby, new UpdateEvent()
                .setEnabledRoles(lobby.enabledRoles));
    });

    ServerEventBroker.on('start_game', (lobby: ServerLobby, event: StartGameEvent) => {
        // Check that the event is from the host
        if (event.origin !== lobby.host) {
            console.error("Received start_game event from non-host:", event.origin);
            // Send an update to make sure clients know they're in the lobby still
            ServerEventBroker
                .getInstance()
                .sendTo(lobby, new UpdateEvent()
                    .setState(lobby.state));
            return;
        }

        // Check that the lobby is in the correct state
        if (lobby.state.state !== GameState.LOBBY) {
            console.error("Received start_game event in invalid state:", lobby.state.state);
            // Send an update to make sure clients know they're in the lobby still
            ServerEventBroker
                .getInstance()
                .sendTo(lobby, new UpdateEvent()
                    .setState(lobby.state));
            return;
        }

        // Check that there are enough players to start
        if (lobby.getPlayerCount() < 5) {
            console.error("Received start_game event with too few players:", lobby.getPlayerCount());
            // Send an update to make sure clients know they're in the lobby still
            ServerEventBroker
                .getInstance()
                .sendTo(lobby, new UpdateEvent()
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
            roles.push(minion);
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
            ServerEventBroker.getInstance().sendTo(l, new RoleRevealEvent());

            // At this point, we wait for a team proposal from the leader
        });
    });

    ServerEventBroker.on("team_proposal", (lobby: ServerLobby, event: TeamProposalEvent) => {
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
            return;
        }

        // Update the state
        lobby.state.team = event.team;

        // Send the update
        updatePlayers(lobby, (event: UpdateEvent) => {
            event
                .setState(lobby.state)
                .setLeader(lobby.leader!);
        });
    });
}
