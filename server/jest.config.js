/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testEnvironment: "node",
    testEnvironmentOptions: {
        "-r": "-r tsconfig-paths/register",
    },
    transform: {
        "^.+\.tsx?$": ["ts-jest", {}],
    },
    modulePaths: ["<rootDir>", "<rootDir>/src"],
    moduleNameMapper: {
        "\\.\\./networking/mail.js": "<rootDir>/src/networking/mail.ts",
        "\\./game/logic.js": "<rootDir>/src/game/logic.ts",
        "\\./game/sockets.js": "<rootDir>/src/game/sockets.ts",
        "\\.\\./models/user.js": "<rootDir>/src/models/user.ts",
        "@common/game/mobile": "<rootDir>/../common/game/mobile",
        "@common/game/events": "<rootDir>/../common/game/events",
        "@common/game/roles": "<rootDir>/../common/game/roles",
        "@common/game/state": "<rootDir>/../common/game/state",
        "@common/game/timing": "<rootDir>/../common/game/timing",
        "@common/util/random": "<rootDir>/../common/util/random",
        "@common/util/validation": "<rootDir>/../common/util/validation",
    }
};
