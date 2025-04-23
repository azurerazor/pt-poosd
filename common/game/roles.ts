/**
 * Describes the alignment of a role
 */
export type Alignment = "good" | "evil";

/**
 * Map of alignments to role identifiers (values are used for RoleId)
 */
export const TEAMS = {
  good: ["servant", "merlin", "percival"],
  evil: ["minion", "morgana", "mordred", "assassin", "oberon"],
} as const;

/**
 * Describes the identifier of a role given a certain alignment
 */
export type RoleIdOfTeam<T extends Alignment> = (typeof TEAMS)[T][number];

/**
 * Describes the identifier of a certain role
 */
export type RoleId = (typeof TEAMS)[keyof typeof TEAMS][number];

/**
 * Describes information and dependencies for all roles
 */
export const ROLE_RELATIONS = {
  servant: {
    dependencies: [],
    information: [],
  },
  merlin: {
    dependencies: [],
    information: TEAMS.evil.filter((role) => role !== "mordred"),
  },
  percival: {
    dependencies: ["merlin", "morgana"],
    information: ["merlin", "morgana"],
  },

  minion: {
    dependencies: [],
    information: TEAMS.evil.filter((role) => role !== "oberon"),
  },
  morgana: {
    dependencies: ["merlin", "percival"],
    information: TEAMS.evil.filter((role) => role !== "oberon"),
  },
  mordred: {
    dependencies: [],
    information: TEAMS.evil.filter((role) => role !== "oberon"),
  },
  assassin: {
    dependencies: ["merlin"],
    information: TEAMS.evil.filter((role) => role !== "oberon"),
  },
  oberon: {
    dependencies: [],
    information: [],
  },
} as const;

/**
 * Describes the alignment of a role given its identifier
 */
export type AlignmentOf<TRole extends RoleId> =
  TRole extends RoleIdOfTeam<"good">
    ? "good"
    : TRole extends RoleIdOfTeam<"evil">
      ? "evil"
      : Alignment;

/**
 * Describes the dependencies of a role given its identifier
 */
export type DependenciesOf<TRole extends RoleId> =
  (typeof ROLE_RELATIONS)[TRole]["dependencies"];

/**
 * Describes the information a role can see given its identifier
 */
export type InformationOf<TRole extends RoleId> =
  (typeof ROLE_RELATIONS)[TRole]["information"];

/**
 * Describes a single role or set of roles
 *
 * We have to override set operations for proper typing
 */
export class RoleSet {
  public static readonly ALL: RoleSet = new RoleSet(
    ...Object.values(TEAMS).flat(),
  );
  public static readonly NONE: RoleSet = new RoleSet();
  public static readonly GOOD: RoleSet = new RoleSet(...TEAMS.good);
  public static readonly EVIL: RoleSet = new RoleSet(...TEAMS.evil);

  private readonly roles: ReadonlySet<RoleId>;
  public readonly size: number;

  public constructor(...roles: RoleId[]) {
    this.roles = new Set<RoleId>(roles);
    this.size = this.roles.size;
  }

  /**
   * Creates a new RoleSet from the given roles
   */
  public static of(...roles: RoleId[]): RoleSet {
    return new RoleSet(...roles);
  }

  /**
   * Gets the union of this set with the given roles or role sets
   */
  public or(...other: RoleId[] | RoleSet[]): RoleSet {
    const roles = new Set(this.roles);
    for (const r of other) {
      if (r instanceof RoleSet) r.roles.forEach(roles.add);
      else roles.add(r);
    }
    return RoleSet.of(...Array.from(roles));
  }

  /**
   * Gets the intersection of this set with the given roles or role sets
   */
  public and(...other: RoleId[] | RoleSet[]): RoleSet {
    if (this.size === 0 || other.length === 0) return this;
    if (other[0] instanceof RoleSet) {
      return this.filter(other[0].has).and(...other.slice(1));
    }
    return RoleSet.of(...(other as RoleId[]).filter(this.has));
  }

  /**
   * Gets the difference of this set with the given roles or role sets
   */
  public andNot(...other: RoleId[] | RoleSet[]): RoleSet {
    const roles = new Set(this.roles);
    for (const r of other) {
      if (r instanceof RoleSet) r.roles.forEach(roles.delete);
      else roles.delete(r);
    }
    return RoleSet.of(...Array.from(roles));
  }

  /**
   * Filters this set based on a given predicate for RoleData
   */
  public filter(predicate: (role_id: RoleId) => boolean): RoleSet {
    const roles = new Set<RoleId>();
    for (const role_id of this.roles) {
      if (predicate(role_id)) roles.add(role_id);
    }
    return RoleSet.of(...Array.from(roles));
  }

  /**
   * Checks if the given role is in this set
   */
  public has(role: RoleId): boolean {
    return this.roles.has(role);
  }

  /**
   * Iterates over the roles in this set
   */
  public forEach(callback: (role_id: RoleId) => void): void {
    this.roles.forEach(callback);
  }
}

/**
 * Describes information about a role for display and logic
 */
export class RoleData<TRole extends RoleId> {
  /**
   * The human-readable name of the role
   */
  public readonly name: string;

  /**
   * A description of the role and its abilities/information
   */
  public readonly description: string;

  /**
   * The role's alignment
   */
  public readonly alignment: AlignmentOf<TRole>;

  /**
   * The set of roles that must be present for this role to be enabled
   */
  public readonly dependencies: RoleSet;

  /**
   * The set of roles this role can see
   */
  public readonly information: RoleSet;

  public constructor(
    id: TRole,
    name: string,
    description: string,
    alignment: AlignmentOf<TRole>,
  ) {
    this.name = name;
    this.description = description;
    this.alignment = alignment;
    this.dependencies = RoleSet.of(...ROLE_RELATIONS[id].dependencies);
    this.information = RoleSet.of(...ROLE_RELATIONS[id].information);
  }

  /**
   * Checks if this role is aligned with good
   */
  public isGood(): boolean {
    return this.alignment === "good";
  }

  /**
   * Checks if this role is aligned with evil
   */
  public isEvil(): boolean {
    return this.alignment === "evil";
  }

  /**
   * Checks whether this role can see the given role
   */
  public canSee(role: RoleId): boolean {
    return this.information.has(role);
  }
}

/**
 * Holds the properties of all roles in the game
 */
export const ROLES: { [TRole in RoleId]: RoleData<TRole> } = {
  servant: new RoleData(
    "servant",
    "Servant of Arthur",
    "A loyal servant of Arthur. Does not know any other players' roles.",
    "good",
  ),

  merlin: new RoleData(
    "merlin",
    "Merlin",
    "A loyal servant of Arthur. Knows the evil players (except Mordred), but must be careful not to reveal himself.",
    "good",
  ),

  percival: new RoleData(
    "percival",
    "Percival",
    "A loyal servant of Arthur. Sees Merlin and Morgana, but not which is which.",
    "good",
  ),

  minion: new RoleData(
    "minion",
    "Minion of Mordred",
    "A servant of Mordred. Knows the other evil players (except Oberon).",
    "evil",
  ),

  morgana: new RoleData(
    "morgana",
    "Morgana",
    "A servant of Mordred. Knows the other evil players (except Oberon). Appears as Merlin to Percival.",
    "evil",
  ),

  mordred: new RoleData(
    "mordred",
    "Mordred",
    "The evil sorcerer. Knows the other evil players (except Oberon). Unknown to Merlin.",
    "evil",
  ),

  assassin: new RoleData(
    "assassin",
    "Assassin",
    "A servant of Mordred. Knows the other evil players (except Oberon). Can assassinate Merlin at the end of the game.",
    "evil",
  ),

  oberon: new RoleData(
    "oberon",
    "Oberon",
    "A servant of Mordred. Does not know and is unknown by the other evil players.",
    "evil",
  ),
};
