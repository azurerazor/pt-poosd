export enum Alignment {
    GOOD = 0,
    EVIL = 1
}

/**
 * Enum flags for the roles in the game.
 */
export enum Roles {
    NONE = 0,

    SERVANT_OF_ARTHUR = 1,
    MERLIN = 2,
    PERCIVAL = 4,

    MINION_OF_MORDRED = 8,
    MORGANA = 16,
    MORDRED = 32,
    ASSASSIN = 64,
    OBERON = 128,

    GOOD = 1 | 2 | 4,
    EVIL = 8 | 16 | 32 | 64 | 128,
    ANY = GOOD | EVIL,

    DEFAULT_ROLES =
    SERVANT_OF_ARTHUR | MINION_OF_MORDRED
    | MERLIN | MORGANA
    | PERCIVAL,

    SPECIAL_ROLES = 
    MERLIN | PERCIVAL | MORGANA
    | MORDRED | OBERON | ASSASSIN
}

/**
 * The set of roles required to enable a given role.
 */
export const role_requirements: { [key: number]: Roles } = {
    [Roles.SERVANT_OF_ARTHUR]: Roles.NONE,
    [Roles.MERLIN]: Roles.NONE,
    [Roles.PERCIVAL]: Roles.MERLIN | Roles.MORGANA,

    [Roles.MINION_OF_MORDRED]: Roles.NONE,
    [Roles.MORGANA]: Roles.MERLIN | Roles.PERCIVAL,
    [Roles.MORDRED]: Roles.MERLIN,
    [Roles.ASSASSIN]: Roles.MERLIN,
    [Roles.OBERON]: Roles.NONE,
}

/**
 * The set of roles that require a given role
 * basically the inverse of the above
 */
export const role_dependencies: { [key: number]: Roles } = {
    [Roles.SERVANT_OF_ARTHUR]: Roles.SERVANT_OF_ARTHUR,
    [Roles.MERLIN]: Roles.PERCIVAL | Roles.MORGANA| Roles.MORDRED | Roles.ASSASSIN,
    [Roles.PERCIVAL]: Roles.MORGANA,

    [Roles.MINION_OF_MORDRED]: Roles.NONE,
    [Roles.MORGANA]: Roles.PERCIVAL,
    [Roles.MORDRED]: Roles.NONE,
    [Roles.ASSASSIN]: Roles.NONE,
    [Roles.OBERON]: Roles.NONE,
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
     * The role's image
     */
    public image: string;


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
     * @param image The role's image
     * @param information The role's visible information
     */
    public constructor(role: Roles, alignment: Alignment, name: string, description: string, image: string, information: Roles) {
        this.role = role;
        this.alignment = alignment;
        this.name = name;
        this.description = description;
        this.image = image;
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

    /**
     * Checks if this role can see the given role set
     */
    public canSeeRoles(roles: Roles): boolean {
        return (this.information & roles) === roles;
    }
}

export const servant = new Role(
    Roles.SERVANT_OF_ARTHUR,
    Alignment.GOOD,
    "Servant of Arthur",
    "A loyal servant of Arthur. Does not know any other players' roles.",
    "https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/b4fc2a8a-8367-4be9-b009-71eaa48f882c-d41d8cd98f00b204e9800998ecf8427e.png",
    Roles.NONE
);

export const merlin = new Role(
    Roles.MERLIN,
    Alignment.GOOD,
    "Merlin",
    "A loyal servant of Arthur. Knows the evil players, but must be careful not to reveal himself.",
    "https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/b4fc2a8a-8367-4be9-b009-71eaa48f882c-d41d8cd98f00b204e9800998ecf8427e.png",
    Roles.EVIL & ~Roles.MORDRED
);

export const percival = new Role(
    Roles.PERCIVAL,
    Alignment.GOOD,
    "Percival",
    "A loyal servant of Arthur. Sees Merlin and Morgana, but not which is which.",
    "https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/ed963445-6c3d-4c46-b22c-85f17fb3c60e-d41d8cd98f00b204e9800998ecf8427e.png",
    Roles.MERLIN | Roles.MORGANA
);

export const minion = new Role(
    Roles.MINION_OF_MORDRED,
    Alignment.EVIL,
    "Minion of Mordred",
    "A servant of Mordred. Knows the other evil players (except Oberon).",
    //Update this
    "https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/ed963445-6c3d-4c46-b22c-85f17fb3c60e-d41d8cd98f00b204e9800998ecf8427e.png",
    Roles.EVIL & ~Roles.OBERON
);

export const morgana = new Role(
    Roles.MORGANA,
    Alignment.EVIL,
    "Morgana",
    "A servant of Mordred. Knows the other evil players (except Oberon). Appears as Merlin to Percival.",
    "https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/bffe4547-0177-4f5f-a737-eae1cbe20674-d41d8cd98f00b204e9800998ecf8427e.png",
    Roles.EVIL & ~Roles.OBERON
);

export const mordred = new Role(
    Roles.MORDRED,
    Alignment.EVIL,
    "Mordred",
    "A servant of Mordred. Unknown to Merlin.",
    "https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/86af9c9a-2d00-4e10-bded-acbc898ff770-d41d8cd98f00b204e9800998ecf8427e.png",
    Roles.EVIL & ~Roles.OBERON
);

export const assassin = new Role(
    Roles.ASSASSIN,
    Alignment.EVIL,
    "Assassin",
    "A servant of Mordred. Knows the other evil players (except Oberon). Can assassinate Merlin at the end of the game.",
    "https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/4ea4f8c0-781e-4e4c-a471-b555279d57b5-d41d8cd98f00b204e9800998ecf8427e.png",
    Roles.EVIL & ~Roles.OBERON
);

export const oberon = new Role(
    Roles.OBERON,
    Alignment.EVIL,
    "Oberon",
    "A servant of Mordred. Unknown to (and does not know) the other evil players.",
    "https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/a6824e40-19c8-4061-9c85-dcb7e5c41f1b-d41d8cd98f00b204e9800998ecf8427e.png",
    Roles.NONE
);

export const all_roles: Role[] = [
    servant,
    merlin,
    percival,

    minion,
    morgana,
    mordred,
    assassin,
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

/**
 * Extracts all Role instances contained in a given role set.
 */
export function getRoles(role: Roles): Role[] {
    return all_roles.filter(r => r.is(role));
}
