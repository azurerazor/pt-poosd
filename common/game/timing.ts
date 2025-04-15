const SECONDS: number = 1000;

/**
 * Amount of time for the role reveal phase.
 */
export const ROLE_REVEAL_TIME: number = 10 * SECONDS;

/**
 * Amount of time players have to vote on a team.
 * 
 * No vote within this time period is considered an abstention.
 */
export const TEAM_VOTE_TIME: number = 10 * SECONDS;

/**
 * Amount of time players have to choose pass/fail on a mission.
 * 
 * No chocie within this time period is considered a pass.
 */
export const MISSION_CHOICE_TIME: number = 10 * SECONDS;

/**
 * Amount of time to show the outcome of a mission
 */
export const MISSION_OUTCOME_TIME: number = 10 * SECONDS;

/**
 * Amount of time players have to guess Merlin for assassination.
 */
export const ASSASSINATION_TIME: number = 10 * SECONDS;
