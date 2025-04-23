import { RoleId, RoleSet } from "./roles.js";

type UserId = string;

type RoundConfig = { teamSize: number; reqFail: number };
type GameConfig = {
  roles: RoleSet;
  rounds: RoundConfig[];
  ladyOfTheLake: boolean;
};

type RoundPhase =
  | "team_select"
  | "team_vote"
  | "mission"
  | "mission_reveal"
  | "lady_choice"
  | "lady_reveal";
type GamePhase =
  | "role_reveal"
  | `round:${RoundPhase}`
  | "assassination"
  | "game_over";

type WithVotesFailed<T> = T extends "round:team_select" | "round:team_vote"
  ? { votesFailed: number }
  : unknown;
type WithCurrentTeam<T> =
  T extends Exclude<`round:${RoundPhase}`, "round:team_select">
    ? { currentTeam: UserId[] }
    : unknown;
type WithVotes<T> = T extends "round:mission_reveal"
  ? { votes: { success: number; fail: number } }
  : unknown;
type GameState = {
  [P in GamePhase]: {
    phase: P;
    config: GameConfig;
    players: UserId[];
    roles: Map<UserId, RoleId>;
    missionResults: boolean[];
    currentMission: number;
    leaderIndex: number;
  } & WithVotesFailed<P> &
    WithCurrentTeam<P> &
    WithVotes<P>;
}[GamePhase];

type GameStateInPhase<T extends GamePhase> = GameState & { phase: T };

type UserInputByPhase = {
  "round:team_select": UserId[];
  "round:team_vote": boolean;
  "round:mission": boolean;
  assassination: UserId;
};
type UserInput<T extends GamePhase> = T extends keyof UserInputByPhase
  ? UserInputByPhase[T]
  : unknown;

abstract class GameTransition<T extends GamePhase> {
  abstract getTargetPlayers(state: GameStateInPhase<T>): UserId[];
  abstract processInteraction(
    state: GameStateInPhase<T>,
    responses: Map<UserId, UserInput<T>>,
  ): GameState;
}

export const GAME_FLOW: { [phase in GamePhase]: GameTransition<phase> } = {
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
  "round:mission": {
    getTargetPlayers(state): UserId[] {
      return state.currentTeam;
    },
    processInteraction(state, responses): GameState {
      let success = 0,
        fail = 0;
      for (const player in state.currentTeam) {
        // undefined assumes success
        if (responses.get(player) == false) {
          fail++;
        } else {
          success++;
        }
      }
      return {
        ...state,
        phase: "round:mission_reveal",
        votes: { success, fail },
        missionResults: [...state.missionResults, fail > 0],
      };
    },
  },
  "round:mission_reveal": {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },
  role_reveal: {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },
  assassination: {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },
  game_over: {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },
  "round:lady_choice": {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },
  "round:lady_reveal": {
    getTargetPlayers(_state): UserId[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },
};
