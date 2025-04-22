import { RoleId } from "./roles.js";

type User = string;

type RoundPhase = "team_select" | "team_vote" | "mission" | "mission_reveal";
type GamePhase =
  | "role_reveal"
  | `round:${RoundPhase}`
  | "assassination"
  | "game_over";

// TODO: round configurations
type GameState = {
  [P in GamePhase]: {
    phase: P;
    players: User[];
    roles: Map<User, RoleId>;
    missionResults: boolean[];
    leader: number;
  } & (P extends `round:${RoundPhase}` ? { votesFailed: number } : object) &
    (P extends Exclude<`round:${RoundPhase}`, "round:team_select">
      ? { currentTeam: User[] }
      : object) &
    (P extends "round:mission_reveal"
      ? { votes: { success: number; fail: number } }
      : object);
}[GamePhase];

type GameStateInPhase<T extends GamePhase> = GameState & { phase: T };

// prettier-ignore
type UserInput<T extends GamePhase> =
    T extends "round:team_select" ? User[] :
    T extends "round:team_vote" ? boolean :
    T extends "round:mission" ? boolean :
    T extends "assassination" ? User
    : never;

abstract class GameEvent<T extends GamePhase> {
  abstract getTargetPlayers(state: GameStateInPhase<T>): User[];
  abstract processInteraction(
    state: GameStateInPhase<T>,
    responses: Map<User, UserInput<T>>,
  ): GameState;
}

export const GAME_FLOW: { [phase in GamePhase]: GameEvent<phase> } = {
  "round:team_select": {
    getTargetPlayers(state: GameStateInPhase<"round:team_select">): User[] {
      return [state.players[state.leader]];
    },
    processInteraction(
      state: GameStateInPhase<"round:team_select">,
      responses: Map<User, User[]>,
    ): GameState {
      return {
        ...state,
        phase: "round:team_vote",
        currentTeam: responses.get(this.getTargetPlayers(state)[0]) ?? [],
      };
    },
  },
  "round:team_vote": {
    getTargetPlayers(state): User[] {
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
        leader: (state.leader + 1) % state.players.length,
        votesFailed: state.votesFailed + 1,
      };
    },
  },
  "round:mission": {
    getTargetPlayers(state): User[] {
      return state.currentTeam;
    },
    processInteraction(state, responses): GameState {
      let success = 0,
        fail = 0;
      for (const player in state.currentTeam) {
        if (responses.get(player) == false) {
          // undefined assumes success
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
    getTargetPlayers(_state): User[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },
  role_reveal: {
    getTargetPlayers(_state): User[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },
  assassination: {
    getTargetPlayers(_state): User[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },
  game_over: {
    getTargetPlayers(_state): User[] {
      throw Error("not implemented");
    },
    processInteraction(_state, _responses): GameState {
      throw Error("not implemented");
    },
  },
};
