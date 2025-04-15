import { Lobby } from "@common/game/state";
import { deleteLobby } from "./lobbies";
import { GameEvent } from "@common/game/events";
import { ServerEventBroker } from "./events";
import { merlin } from "@common/game/roles";

/**
 * Describes a possible set of events we're waiting for,
 * such as receiving votes or mission choices.
 */
export enum WaitingFor {
    /**
     * Not waiting for anything
     */
    NONE = "none",

    /**
     * Waiting for a team proposal vote
     */
    TEAM_VOTE = "team_vote",

    /**
     * Waiting for mission pass/fail choices
     */
    MISSION_CHOICES = "mission_choices",

    /**
     * Waiting for assassination guesses
     */
    ASSASSINATION_GUESSES = "assassination_guesses",
}

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

    /**
     * Map of players to Merlin guesses for assassination
     */
    private readonly merlinGuessMap: Map<string, string> = new Map();

    /**
     * What we're currently waiting for, if anything
     */
    public waitingFor: WaitingFor = WaitingFor.NONE;

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
        const callback = this.onReadyCallback;
        this.onReadyCallback = () => { }; // Reset the callback
        this.readySet.clear(); // Clear the ready map
        
        // Call the callback
        callback(this);
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
     * Checks whether the current mission is passing.
     */
    public isMissionPassing(): boolean {
        return this.getNumFails() < this.getMissionFailCount();
    }

    /**
     * Clears the mission pass/fail map.
     */
    public clearMissionChoices(): void {
        this.missionMap.clear();
    }

    /**
     * Sets a player's guess for the current Merlin assassination.
     */
    public setMerlinGuess(username: string, guess: string): void {
        this.merlinGuessMap.set(username, guess);
    }

    /**
     * Gets the majority Merlin vote, or null if there was a tie.
     */
    public getAssassinatedPlayer(): string | null {
        const freq = new Map<string, number>();
        for (const guess of this.merlinGuessMap.values()) {
            freq.set(guess, (freq.get(guess) ?? 0) + 1);
        }

        let maxCount = 0;
        let maxPlayer: string | null = null;
        let numMax = 0;
        for (const [player, count] of freq.entries()) {
            if (count > maxCount) {
                maxCount = count;
                maxPlayer = player;
                numMax = 1;
            } else if (count === maxCount) {
                numMax++;
            }
        }
        // On a tie, return null
        if (numMax > 1) return null;

        // Otherwise, return the most guessed player
        return maxPlayer;
    }

    /**
     * Clears the Merlin guess map.
     */
    public clearMerlinGuesses(): void {
        this.merlinGuessMap.clear();
    }

    /**
     * Gets which player is Merlin, if any.
     * 
     * Returns null if no player is assigned to Merlin.
     */
    public getMerlin(): string | null {
        for (const player of this.getPlayers()) {
            if (merlin.is(player.role!)) return player.username;
        }
        return null;
    }

    /**
     * Increments the leader, setting them to the next player that's not online.
     */
    public incrementLeader(): void {
        let index = this.playerOrder.indexOf(this.leader!);
        do {
            index = (index + 1) % this.playerOrder.length;
            this.leader = this.playerOrder[index];
        } while (!this.getPlayer(this.leader)!.isConnected);

        // Set the leader in the player map
        for (const player of this.getPlayers()) {
            player.isLeader = (player.username === this.leader);
        }
    }

    /**
     * Picks a new host from the current players.
     */
    public reassignHost(): void {
        // Pick a new host from the current players
        for (const player of this.getPlayers()) {
            if (player.isConnected) {
                this.host = player.username;
                
                // Set the host in the player map
                for (const p of this.getPlayers()) {
                    p.isHost = (p.username === this.host);
                }
                return;
            }
        }
    }
}
