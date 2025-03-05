export enum Alignment {
    GOOD = 0,
    EVIL = 1
}

export enum Roles {
    NONE = 0,

    SERVANT_OF_ARTHUR = 1,
    MERLIN = 2,
    PERCIVAL = 4,

    MINION_OF_MORDRED = 8,
    MORGANA = 16,
    MORDRED = 32,
    ASSASIN = 64,
    OBERON = 128,

    GOOD = 1 | 2 | 4,
    EVIL = 8 | 16 | 32 | 64 | 128,
    ANY = GOOD | EVIL,
}

export class Role {
    /**
     * The role represented by this object
     */
    public role: Roles;

    /**
     * The alignment of this role
     */
    public alignment: Alignment;

    /**
     * The name of this role
     */
    public name: string;

    /**
     * The role's description
     */
    public description: string;


    /**
     * The information visible to this role
     */
    public information: Roles;

    /**
     * Creates a new role.
     * 
     * @param role The role represented by this object
     * @param alignment The alignment of this role
     * @param name The name of this role
     * @param description The role's description
     */
    public constructor(role: Roles, alignment: Alignment, name: string, description: string, information: Roles) {
        this.role = role;
        this.alignment = alignment;
        this.name = name;
        this.description = description;
        this.information = information;
    }

    /**
     * Checks whether this role is good
     */
    public isGood(): boolean {
        return this.alignment === Alignment.GOOD;
    }

    /**
     * Checks if the role is within a given role set
     */
    public is(role: Roles): boolean {
        return (this.role & role) === this.role;
    }

    /**
     * Checks if this role can see the given role
     */
    public canSee(role: Role): boolean {
        return role.is(this.information);
    }
}

export const servant = new Role(
    Roles.SERVANT_OF_ARTHUR,
    Alignment.GOOD,
    "Servant of Arthur",
    "A loyal servant of Arthur. Does not know any other players' roles.",
    Roles.NONE
);

export const merlin = new Role(
    Roles.MERLIN,
    Alignment.GOOD,
    "Merlin",
    "A loyal servant of Arthur. Knows the evil players, but must be careful not to reveal himself.",
    Roles.EVIL & ~Roles.MORDRED
);

export const percival = new Role(
    Roles.PERCIVAL,
    Alignment.GOOD,
    "Percival",
    "A loyal servant of Arthur. Sees Merlin and Morgana, but not which is which.",
    Roles.MERLIN | Roles.MORGANA
);

export const minion = new Role(
    Roles.MINION_OF_MORDRED,
    Alignment.EVIL,
    "Minion of Mordred",
    "A servant of Mordred. Knows the other evil players (except Oberon).",
    Roles.EVIL & ~Roles.OBERON
);

export const morgana = new Role(
    Roles.MORGANA,
    Alignment.EVIL,
    "Morgana",
    "A servant of Mordred. Knows the other evil players (except Oberon). Appears as Merlin to Percival.",
    Roles.EVIL & ~Roles.OBERON
);

export const mordred = new Role(
    Roles.MORDRED,
    Alignment.EVIL,
    "Mordred",
    "A servant of Mordred. Unknown to Merlin.",
    Roles.EVIL & ~Roles.OBERON
);

export const assasin = new Role(
    Roles.ASSASIN,
    Alignment.EVIL,
    "Assasin",
    "A servant of Mordred. Knows the other evil players (except Oberon). Can assassinate Merlin at the end of the game.",
    Roles.EVIL & ~Roles.OBERON
);

export const oberon = new Role(
    Roles.OBERON,
    Alignment.EVIL,
    "Oberon",
    "A servant of Mordred. Unknown to (and does not know) the other evil players.",
    Roles.NONE
);

export const all_roles: Role[] = [
    servant,
    merlin,
    percival,

    minion,
    morgana,
    mordred,
    assasin,
    oberon
];

/**
 * Gets the role name for a given role.
 */
export function getRoleName(role: Roles): string {
    for (let r of all_roles) {
        if (r.is(role)) return r.name;
    }
    return "Unknown";
}

/**
 * Gets the role with a given name. Defaults to servant if none is found.
 */
export function getRoleByName(name: string): Role {
    for (let r of all_roles) {
        if (r.name === name) return r;
    }
    return servant;
}
