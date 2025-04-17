import { GameEvent } from "@common/game/events";
import { createEventRegistry } from "@common/game/event_registries";

class ServerEvent<TData> implements GameEvent<TData> {
    constructor(
        public readonly type: string,
        public readonly origin: string,
        public readonly data: TData
    ) { }
}

/**
 * The registry for events with server-side handlers.
 * 
 * Events are described in common code: @see Events
 */
const ServerEvents = createEventRegistry<ServerEvent<any>>({
    emit: async () => { throw new Error('Not implemented'); },
    on: () => { throw new Error('Not implemented'); }
});

console.log(ServerEvents.TEAM_VOTE.id);
