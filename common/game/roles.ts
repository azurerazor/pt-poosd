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
export type RoleIdOfTeam<Team extends Alignment> = (typeof TEAMS)[Team][number];

/**
 * Describes the identifier of a certain role
 */
export type RoleId = (typeof TEAMS)[keyof typeof TEAMS][number];

/**
 * List of all role identifiers
 */
export const ROLE_IDS: RoleId[] = [...TEAMS.good, ...TEAMS.evil];

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
  (typeof ROLE_RELATIONS)[TRole]["dependencies"][number];

/**
 * Describes the information a role can see given its identifier
 */
export type InformationOf<TRole extends RoleId> =
  (typeof ROLE_RELATIONS)[TRole]["information"][number];

/**
 * Describes a single role or set of roles
 */
export class RoleSet<TRole extends RoleId = RoleId> implements Iterable<TRole> {
  /**
   * The set of roles
   */
  private readonly roles: ReadonlySet<RoleId>;

  /**
   * The size of the set
   */
  public readonly size: number;

  public constructor(...roles: TRole[]) {
    this.roles = new Set(roles);
    this.size = this.roles.size;
  }

  /**
   * Constructs a RoleSet from a list of roles
   */
  public static of<TRole extends RoleId>(...roles: TRole[]): RoleSet<TRole> {
    return new RoleSet(...roles);
  }

  /**
   * Checks if the set is empty
   */
  public isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Checks if the set contains a set of roles
   */
  public has<TCheck extends RoleId>(
    ...roles: TCheck[]
  ): TCheck extends TRole ? true : false {
    for (const role of roles) {
      if (!this.roles.has(role))
        return false as TCheck extends TRole ? true : false;
    }
    return true as TCheck extends TRole ? true : false;
  }

  /**
   * Gets the union with another RoleSet
   */
  public union<TOther extends RoleId>(
    other: RoleSet<TOther>,
  ): RoleSet<TRole | TOther> {
    const roles = new Set<TRole | TOther>(this.roles as ReadonlySet<TRole>);
    for (const role of other.roles) {
      roles.add(role as TRole | TOther);
    }
    return new RoleSet(...roles);
  }

  /**
   * Gets the intersection with another RoleSet
   */
  public intersect<TOther extends RoleId>(
    other: RoleSet<TOther>,
  ): RoleSet<TRole & TOther> {
    const roles = new Set<TRole & TOther>();
    for (const role of this.roles) {
      if (!other.has(role)) continue;
      roles.add(role as TRole & TOther);
    }
    return new RoleSet(...roles);
  }

  /**
   * Filters the roles in the set based on a predicate
   */
  public filter(predicate: (role: TRole) => boolean): RoleSet<TRole> {
    const roles = new Set<TRole>();
    for (const role of this.roles) {
      if (predicate(role as TRole)) {
        roles.add(role as TRole);
      }
    }
    return new RoleSet(...roles);
  }

  /**
   * Enumerates roles in the set
   */
  public *[Symbol.iterator](): IterableIterator<TRole> {
    for (const role of this.roles) yield role as TRole;
  }

  /**
   * Maps the roles in the set to a new value
   */
  public map<TResult>(callback: (role: TRole) => TResult): TResult[] {
    const result: TResult[] = [];
    for (const role of this) {
      result.push(callback(role as TRole));
    }
    return result;
  }

  /**
   * Runs a callback for each role in the set
   */
  public forEach(callback: (role: TRole) => void): void {
    this.map(callback);
  }
}

/**
 * Describes information about a role for display and logic
 */
export class RoleData<TRole extends RoleId> {
  /**
   * The role's identifier
   */
  public readonly id: TRole;

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
  public readonly dependencies: RoleSet<DependenciesOf<TRole>>;

  /**
   * The set of roles this role can see
   */
  public readonly information: RoleSet<InformationOf<TRole>>;

  public constructor(
    id: TRole,
    name: string,
    description: string,
    alignment: AlignmentOf<TRole>,
  ) {
    this.id = id;
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
export const ROLES: { readonly [TRole in RoleId]: RoleData<TRole> } = {
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
