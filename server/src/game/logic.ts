import { StartGameEvent, UpdateEvent } from "@common/game/events";
import { Alignment, getRoles, minion } from "@common/game/roles";
import { GameState, Outcome } from "@common/game/state";
import { ServerEventBroker } from "./events";
import { ServerLobby } from "./lobby";
import { updatePlayers } from "./sockets";

/**
 * Bootstraps event listeners for primary game logic on the server
 */
export function bootstrapEvents(): void {
    ServerEventBroker.on('start_game', (lobby: ServerLobby, event: StartGameEvent) => {
        if (event.origin !== lobby.host) {
            console.error("Received start_game event from non-host:", event.origin);
            return;
        }

        if (lobby.state.state !== GameState.LOBBY) {
            console.error("Received start_game event in invalid state:", lobby.state.state);
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
            outcomes: [Outcome.NONE, Outcome.NONE, Outcome.NONE, Outcome.NONE, Outcome.NONE],
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
    });
}
