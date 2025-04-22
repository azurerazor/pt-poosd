/**
 * The set of all role identifiers
 */
export const ROLE_IDS = [
  "servant",
  "merlin",
  "percival",

  "minion",
  "morgana",
  "mordred",
  "assassin",
  "oberon",
] as const;

/**
 * Describes the identifier of a certain role
 */
export type RoleId = (typeof ROLE_IDS)[number];

/**
 * Describes a single role or set of roles
 *
 * We have to override set operations for proper typing
 */
export class RoleSet {
  private readonly roles: ReadonlySet<RoleId>;
  public readonly size: number;

  public static readonly EMPTY = RoleSet.of();
  public static readonly ALL = RoleSet.of(...ROLE_IDS);
  public static readonly GOOD = this.ALL.filter((_, role) => role.isGood());
  public static readonly EVIL = this.ALL.filter((_, role) => role.isEvil());

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
    predicate: (role_id: RoleId, role: RoleData) => boolean,
  ): RoleSet {
    const roles = new Set<RoleId>();
    for (const role_id of this.roles) {
      const role = ROLES[role_id];
      if (predicate(role_id, role)) roles.add(role_id);
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
  public forEach(callback: (role_id: RoleId, role: RoleData) => void): void {
    this.roles.forEach((role_id) => callback(role_id, ROLES[role_id]));
  }
}

/**
 * Describes the alignment of a role (good or evil)
 */
export enum Alignment {
  GOOD = "good",
  EVIL = "evil",
}

/**
 * Describes information about a role for display and logic
 */
export class RoleData {
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
    name: string,
    description: string,
    alignment: Alignment,
    information: RoleSet = RoleSet.of(),
    dependencies: RoleSet = RoleSet.of(),
  ) {
    this.name = name;
    this.description = description;
    this.alignment = alignment;
    this.information = information;
    this.dependencies = dependencies;
  }

  /**
   * Checks if this role is aligned with good
   */
  public isGood(): boolean {
    return this.alignment === Alignment.GOOD;
  }

  /**
   * Checks if this role is aligned with evil
   */
  public isEvil(): boolean {
    return this.alignment === Alignment.EVIL;
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
export const ROLES: Record<RoleId, RoleData> = {
  servant: new RoleData(
    "Servant of Arthur",
    "A loyal servant of Arthur. Does not know any other players' roles.",
    Alignment.GOOD,
  ),

  merlin: new RoleData(
    "Merlin",
    "A loyal servant of Arthur. Knows the evil players (except Mordred), but must be careful not to reveal himself.",
    Alignment.GOOD,
    RoleSet.EVIL.andNot("mordred"),
  ),

  percival: new RoleData(
    "Percival",
    "A loyal servant of Arthur. Sees Merlin and Morgana, but not which is which.",
    Alignment.GOOD,
    RoleSet.of("merlin", "morgana"),
    RoleSet.of("merlin", "morgana"),
  ),

  minion: new RoleData(
    "Minion of Mordred",
    "A servant of Mordred. Knows the other evil players (except Oberon).",
    Alignment.EVIL,
    RoleSet.EVIL.andNot("oberon"),
  ),

  morgana: new RoleData(
    "Morgana",
    "A servant of Mordred. Knows the other evil players (except Oberon). Appears as Merlin to Percival.",
    Alignment.EVIL,
    RoleSet.EVIL.andNot("oberon"),
    RoleSet.of("merlin", "percival"),
  ),

  mordred: new RoleData(
    "Mordred",
    "The evil sorcerer. Knows the other evil players (except Oberon). Unknown to Merlin.",
    Alignment.EVIL,
    RoleSet.EVIL.andNot("oberon"),
  ),

  assassin: new RoleData(
    "Assassin",
    "A servant of Mordred. Knows the other evil players (except Oberon). Can assassinate Merlin at the end of the game.",
    Alignment.EVIL,
    RoleSet.EVIL.andNot("oberon"),
    RoleSet.of("merlin"),
  ),

  oberon: new RoleData(
    "Oberon",
    "A servant of Mordred. Does not know and is unknown by the other evil players.",
    Alignment.EVIL,
  ),
};
