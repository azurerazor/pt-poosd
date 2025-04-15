import { Lobby } from "@common/game/state";
import { deleteLobby } from "./lobbies";
import { GameEvent } from "@common/game/events";
import { ServerEventBroker } from "./events";

export class ServerLobby extends Lobby {
    /**
     * Set of clients that have replied ready following the
     * most recent update event.
     */
    private readonly readySet: Set<string> = new Set();

    /**
     * Callback that's run when all players are ready.
     */
    private onReadyCallback: (lobby: ServerLobby) => void = () => { };

    /**
     * Map of players to their vote for the current team proposal
     */
    private readonly voteMap: Map<string, boolean> = new Map();

    /**
     * Map of players to pass/fail for the current mission
     */
    private readonly missionMap: Map<string, boolean> = new Map();

    constructor(id: string, host: string) {
        super(id, host, () => { deleteLobby(id); });
    }

    /**
     * Sends an event to this lobby.
     */
    public send<T extends GameEvent>(event: T): void {
        ServerEventBroker.getInstance().sendTo(this, event);
    }

    /**
     * Marks a player as ready.
     * 
     * If all connected players are ready, triggers the onReady callback.
     */
    public setReady(username: string): void {
        this.readySet.add(username);

        // Check if all players are ready (or disconnected)
        for (const player of this.getPlayers()) {
            if (!player.isConnected) continue;
            if (!this.readySet.has(player.username)) {
                return;
            }
        }

        // All players are ready
        this.onReadyCallback(this);
        this.onReadyCallback = () => { }; // Reset the callback
        this.readySet.clear(); // Clear the ready map
    }

    /**
     * Sets a callback to run the next time everyone in this lobby is ready.
     * Ignores disconnected players.
     * 
     * The callback is reset after it is called.
     */
    public onReady(callback: (lobby: ServerLobby) => void): void {
        this.onReadyCallback = callback;
    }

    /**
     * Clears the ready map; does NOT reset the callback.
     */
    public clearReady(): void {
        this.readySet.clear();
    }

    /**
     * Sets a player's vote for the current team proposal.
     */
    public setVote(username: string, vote: boolean): void {
        this.voteMap.set(username, vote);
    }

    /**
     * Checks whether the current team vote is passing.
     * 
     * Omitted votes are counted as abstentions.
     */
    public isVotePassing(): boolean {
        const votes = [...this.voteMap.values()];

        const yay = votes.filter(v => v).length;
        const nay = votes.length - yay;

        return yay > nay;
    }

    /**
     * Clears the vote map.
     */
    public clearVotes(): void {
        this.voteMap.clear();
    }

    /**
     * Sets a player's pass/fail for the current mission.
     */
    public setMissionChoice(username: string, pass: boolean): void {
        this.missionMap.set(username, pass);
    }

    /**
     * Gets the number of fails for the current mission.
     * 
     * Missing choices are counted as passes.
     */
    public getNumFails(): number {
        const votes = [...this.missionMap.values()];

        return votes.filter(v => !v).length;
    }

    /**
     * Clears the mission pass/fail map.
     */
    public clearMissionChoices(): void {
        this.missionMap.clear();
    }
}
