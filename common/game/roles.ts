/**
 * Describes the alignment of a role
 */
export type Alignment = "good" | "evil";

/**
 * Map of alignments to role identifiers (values are used for RoleId)
 */
export const TEAMS = {
  "good": [
    "servant",
    "merlin",
    "percival",
  ],

  "evil": [
    "minion",
    "morgana",
    "mordred",
    "assassin",
    "oberon",
  ],
} as const;

/**
 * Describes the identifier of a certain role
 */
export type RoleId = (typeof TEAMS)[Alignment][number];

/**
 * Describes information and dependencies for all roles
 */
export const RoleRelations: {
  readonly [role in RoleId]: {
    dependencies: readonly RoleId[],
    information: readonly RoleId[]
  }
} = {
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
};

/**
 * Describes a single role or set of roles
 *
 * We have to override set operations for proper typing
 */
export class RoleSet {
  public static readonly ALL: RoleSet = new RoleSet(...Object.values(TEAMS).flat());
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
  public filter(
    predicate: (role_id: RoleId) => boolean,
  ): RoleSet {
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
export class RoleData {
  /**
   * The role's identifier
   */
  public readonly id: RoleId;

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
  public readonly alignment: Alignment;

  /**
   * The set of roles this role can see
   */
  public readonly information: RoleSet;

  /**
   * The set of roles that must be present for this role to be enabled
   */
  public readonly dependencies: RoleSet;

  public constructor(
    id: RoleId,
    name: string,
    description: string,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.alignment = RoleSet.GOOD.has(id) ? "good" : "evil";
    this.information = RoleSet.of(...RoleRelations[id].information);
    this.dependencies = RoleSet.of(...RoleRelations[id].dependencies);
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
export const ROLES: { [role in RoleId]: RoleData } = {
  servant: new RoleData(
    "servant",
    "Servant of Arthur",
    "A loyal servant of Arthur. Does not know any other players' roles.",
  ),

  merlin: new RoleData(
    "merlin",
    "Merlin",
    "A loyal servant of Arthur. Knows the evil players (except Mordred), but must be careful not to reveal himself.",
  ),

  percival: new RoleData(
    "percival",
    "Percival",
    "A loyal servant of Arthur. Sees Merlin and Morgana, but not which is which.",
  ),

  minion: new RoleData(
    "minion",
    "Minion of Mordred",
    "A servant of Mordred. Knows the other evil players (except Oberon).",
  ),

  morgana: new RoleData(
    "morgana",
    "Morgana",
    "A servant of Mordred. Knows the other evil players (except Oberon). Appears as Merlin to Percival.",
  ),

  mordred: new RoleData(
    "mordred",
    "Mordred",
    "The evil sorcerer. Knows the other evil players (except Oberon). Unknown to Merlin.",
  ),

  assassin: new RoleData(
    "assassin",
    "Assassin",
    "A servant of Mordred. Knows the other evil players (except Oberon). Can assassinate Merlin at the end of the game.",
  ),

  oberon: new RoleData(
    "oberon",
    "Oberon",
    "A servant of Mordred. Does not know and is unknown by the other evil players.",
  ),
};
