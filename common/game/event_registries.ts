import { EventListener, Events, EventSocket, EventType, GameEvent } from "@common/game/events";

/**
 * Maps event identifiers to event type instances
 */
export type EventTypeMap<TEvent extends GameEvent<any>> = {
    [eventId: string]: EventType<any, any, TEvent & GameEvent<any>>;
};

/**
 * Maps event identifiers to registered event listeners
 */
export type EventListenerMap<TEvent extends GameEvent<any>> = {
    [eventId: string]: Array<EventListener<TEvent & GameEvent<any>, any, TEvent>>;
};

/**
 * Describes a factory for creating a concrete event type.
 * 
 * The factory is defined by common code (see Events below) and
 * concretized to an actual EventType on the client and server
 * when a sided EventRegistry is constructed.
 */
type EventTypeFactory<TData, TReply> = <TEvent extends GameEvent<TData>>(
    create: <T, R>(id: string) => EventType<T, R, TEvent & GameEvent<T>>
) => EventType<TData, TReply, TEvent & GameEvent<TData>>;

/**
 * Helper type to extract static event types
 */
type StaticEventTypeFactories<T> = {
    [K in keyof T]: T[K] extends EventTypeFactory<any, any> ? K : never
}[keyof T];

/**
 * Helper type to map static event types to concrete implementations
 */
type SidedEvents<T, TEvent extends GameEvent<any>> = {
    [K in StaticEventTypeFactories<T>]: T[K] extends EventTypeFactory<infer TData, infer TReply>
    ? EventType<TData, TReply, TEvent & GameEvent<TData>>
    : never;
};

/**
 * Describes a sided event registry
 */
export interface EventRegistry<TEvent extends GameEvent<any>> extends SidedEvents<typeof Events, TEvent> {
    /**
     * The socket this registry is bound to
     */
    readonly socket: EventSocket<TEvent>;

    /**
     * The event types registered in this registry
     */
    readonly eventTypes: EventTypeMap<TEvent>;

    /**
     * Registers a sided event type
     */
    register<TData, TReply>(id: string): EventType<TData, TReply, TEvent & GameEvent<TData>>;

    /**
     * Registers a listener for a given event type
     */
    addListener<TData, TReply>(
        type: string,
        listener: EventListener<TData, TReply, TEvent & GameEvent<TData>>
    ): void;

    /**
     * Dispatches an event of the given type
     */
    dispatch<TData, TReply>(
        event: TEvent & GameEvent<TData>
    ): Promise<TReply>;
}

/**
 * Creates a sided event registry.
 * 
 * Actual event types are static properties dynamically assigned
 * by createEventRegistry (and taken from the Events class).
 */
export function createEventRegistry<TEvent extends GameEvent<any>>(socket: EventSocket<TEvent>): EventRegistry<TEvent> {
    const EventRegistry = {
        socket,
        eventTypes: {} as EventTypeMap<TEvent>,

        register<TData, TReply>(id: string): EventType<TData, TReply, TEvent> {
            const res = new EventType<TData, TReply, TEvent>(id, EventRegistry.socket);
            return EventRegistry.eventTypes[id] = res;
        },

        addListener<TData, TReply>(type: string, listener: EventListener<TData, TReply, TEvent>) {
            EventRegistry.socket.on(type, listener);
        },

        dispatch<TData, TReply>(event: GameEvent<TData>): Promise<TReply> {
            const type = EventRegistry.eventTypes[event.type];
            if (!type) {
                throw new Error(`Attempting to dispatch unregistered event type: ${type}`);
            }

            // Emit the event to the socket
            return EventRegistry.socket.emit(type, event.data);
        },
    };

    for (const key of Object.getOwnPropertyNames(Events)) {
        const factory = (Events as any)[key];
        if (!(factory instanceof Function) || factory.length !== 1) continue;

        const eventType = factory.resolve(EventRegistry.register);
        (EventRegistry as any)[key] = eventType;
    }

    return EventRegistry as any;
}
