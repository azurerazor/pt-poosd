import { RoleId, RoleSet } from "@common/game/roles.js";

/**
 * The type of a unique identifier for a user in the lobby
 */
type UserId = string;

/**
 * Describes configuration for a single round
 */
type RoundConfig = {
  /**
   * The number of players required to go on this mission
   */
  teamSize: number;

  /**
   * The number of fails required for this mission to fail
   */
  reqFail: number;
};

/**
 * Describes configuration for a lobby (remains constant throughout the game)
 */
type GameConfig = {
  /**
   * The set of enabled roles for this game
   */
  roles: RoleSet;

  /**
   * The configuration for each round (zero-indexed)
   */
  rounds: RoundConfig[];

  /**
   * Whether the Lady of the Lake is enabled
   */
  ladyOfTheLake: boolean;
};

/**
 * Describes a phase within one of the 5 rounds
 */
type RoundPhase =
  | "team_select"
  | "team_vote"
  | "mission"
  | "mission_reveal"
  | "lady_choice"
  | "lady_reveal";

/**
 * Describes the current game phase, including a phase within a round
 */
type GamePhase =
  | "role_reveal"
  | `round:${RoundPhase}`
  | "assassination"
  | "game_over";

/**
 * Includes how many votes have failed in a row
 */
type WithVotesFailed<TPhase> =
  TPhase extends `round:${"team_select" | "team_vote"}`
    ? { votesFailed: number }
    : unknown;

/**
 * Includes the current team of players
 */
type WithCurrentTeam<TPhase> =
  TPhase extends Exclude<`round:${RoundPhase}`, "round:team_select">
    ? { currentTeam: UserId[] }
    : unknown;

/**
 * Includes a count of succeeded and failed votes
 */
type WithVotes<TPhase> = TPhase extends "round:mission_reveal"
  ? { votes: { success: number; fail: number } }
  : unknown;

/**
 * Describes the current state of the game, along with any available
 * information relevant to the current phase
 */
type GameState = {
  [TPhase in GamePhase]: {
    /**
     * The current phase of the game
     */
    phase: TPhase;

    /**
     * The configuration of the game (constant throughout phases)
     */
    config: GameConfig;

    /**
     * The list of connected players
     */
    players: UserId[];

    /**
     * The roles assigned to each player
     */
    roles: Map<UserId, RoleId>;

    /**
     * The results of missions so far
     */
    missionResults: boolean[];

    /**
     * The current round of the game
     */
    currentMission: number;

    /**
     * The index of the current leader in the player list
     */
    leaderIndex: number;
  } & WithVotesFailed<TPhase> &
    WithCurrentTeam<TPhase> &
    WithVotes<TPhase>;
}[GamePhase];

/**
 * Describes the state of the game in a specific phase
 */
type GameStateInPhase<TPhase extends GamePhase> = GameState & { phase: TPhase };

/**
 * Maps the game phase to the type of user input required for that phase
 */
type UserInputByPhase = {
  "round:team_select": UserId[];
  "round:team_vote": boolean;
  "round:mission": boolean;
  assassination: UserId;
};

/**
 * Describes the type of user input required for a given phase
 */
type UserInput<T extends GamePhase> = T extends keyof UserInputByPhase
  ? UserInputByPhase[T]
  : unknown;

/**
 * Describes a transition from some game state (in a specific phase) to another,
 * along with the type of user input required for that transition and functions
 * to decide the new game state
 */
abstract class GameTransition<TFrom extends GamePhase> {
  abstract getTargetPlayers(state: GameStateInPhase<TFrom>): UserId[];
  abstract processInteraction(
    state: GameStateInPhase<TFrom>,
    responses: Map<UserId, UserInput<TFrom>>,
  ): GameState;
}

/**
 * Describes the flow of the game through transitions from all phases
 */
export const GAME_FLOW: { [TFrom in GamePhase]: GameTransition<TFrom> } = {
  /**
   * Team selection: the current leader selects a team to go on this mission
   */
  "round:team_select": {
    getTargetPlayers(state: GameStateInPhase<"round:team_select">): UserId[] {
      return [state.players[state.leaderIndex]];
    },
    processInteraction(
      state: GameStateInPhase<"round:team_select">,
      responses: Map<UserId, UserId[]>,
    ): GameState {
      return {
        ...state,
        phase: "round:team_vote",
        currentTeam: responses.get(this.getTargetPlayers(state)[0]) ?? [],
      };
    },
  },

  /**
   * Team voting: all players vote to approve or reject the proposed team
   */
  "round:team_vote": {
    getTargetPlayers(state): UserId[] {
      return state.players;
    },
    processInteraction(state, responses): GameState {
      let votes = 0;
      for (const player in state.players) {
        if (responses.get(player)) {
          votes++;
        }
      }
      if (2 * votes > state.players.length) {
        return {
          ...state,
          phase: "round:mission",
        };
      }
      return {
        ...state,
        phase: "round:team_select",
        leaderIndex: (state.leaderIndex + 1) % state.players.length,
        votesFailed: state.votesFailed + 1,
      };
    },
  },

  /**
   * Mission: the current team passes or fails the ongoing mission
   */
  "round:mission": {
    getTargetPlayers(state): UserId[] {
      return state.currentTeam;
    },
    processInteraction(state, responses): GameState {
      let success = 0,
        fail = 0;
      for (const player in state.currentTeam) {
        // undefined assumes success
        if (responses.get(player) === false) {
          fail++;
        } else {
          success++;
        }
      }
      // Retrieve the number of fails required from round config
      const reqFails = state.config.rounds[state.currentMission].reqFail;
      return {
        ...state,
        phase: "round:mission_reveal",
        votes: { success, fail },
        missionResults: [...state.missionResults, fail >= reqFails],
      };
    },
  },

  /**
   * Mission reveal: the results of the mission are shown to all players
   */
  "round:mission_reveal": {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },

  /**
   * Role reveal: all players receive their role assignment + information
   */
  role_reveal: {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },

  /**
   * Assassination: the assassin (or all evil players) guess(es) the identity of Merlin
   */
  assassination: {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },

  /**
   * Game over: the game ends and results are shown to all players
   */
  game_over: {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },

  /**
   * Lady of the Lake: the current player chooses a player whose role to see
   */
  "round:lady_choice": {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },

  /**
   * Lady of the Lake reveal: the chosen player's role is revealed to the player with the Lady
   */
  "round:lady_reveal": {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },
};
