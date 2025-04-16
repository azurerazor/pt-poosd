const { merlin } = require("@common/game/roles");
const request = require("supertest");

describe("Merlin role name", () => {
    it("should return 'merlin' for merlin role name", async () => {
        return merlin.name === "merlin";
    });
});
