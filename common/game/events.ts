/**
 * Describes a base event with specific data and reply types.
 * The data is wrapped in this class for generic handling.
 *
 * Server and client events are derived from this type.
 */
export interface GameEvent<TData> {
  /**
   * The event type identifier
   */
  readonly type: string;

  /**
   * The event origin
   *
   * If the event was sent by a client, this is the client username.
   * If it was sent by the server, this is an empty string.
   */
  readonly origin: string;

  /**
   * The event data
   */
  readonly data: TData;
}

/**
 * Describes an event listener for a sided event type.
 */
export interface EventListener<TData, TReply, TEvent extends GameEvent<TData>> {
  (event: TEvent): Promise<TReply>;
}

/**
 * Describes a socket for emitting and receiving events.
 */
export interface EventSocket<TEvent extends GameEvent<any>> {
  /**
   * Emits an event of the given type and data, returning a reply from the other side
   */
  emit: <TData, TReply>(
    type: EventType<TData, TReply, TEvent>,
    data: TData,
  ) => Promise<TReply>;

  /**
   * Listens for receipt of an event with the given identifier
   */
  on: <TData, TReply>(
    type: string,
    callback: EventListener<TData, TReply, TEvent>,
  ) => void;
}

/**
 * Describes a registered event type with an identifier, data and reply types.
 */
export class EventType<TData, TReply, TEvent extends GameEvent<TData>> {
  /**
   * The event identifier
   */
  public readonly id: string;

  /**
   * The socket this event type is passed through
   */
  private readonly _socket: EventSocket<TEvent>;

  /**
   * Constructs a new event type
   */
  constructor(id: string, socket: EventSocket<TEvent>) {
    this.id = id;
    this._socket = socket;
  }

  /**
   * Listens for an event of this type.
   */
  public on(callback: (event: TEvent) => Promise<TReply>): void {
    this._socket.on(this.id, callback);
  }

  /**
   * Sends an event of this type.
   */
  public send(data: TData): Promise<TReply> {
    return this._socket.emit(this, data);
  }
}

/**
 * Registers an event type with the given id.
 *
 * This returns a factory that will be resolved by the sided registry.
 */
function event<TData, TReply>(
  id: string,
): <TEvent extends GameEvent<TData>>(
  create: <T, R>(id: string) => EventType<T, R, TEvent & GameEvent<T>>,
) => EventType<TData, TReply, TEvent & GameEvent<TData>> {
  return (create) => create(id);
}

/**
 * Describes the game's event types.
 *
 * These are concretized by createEventRegistry on the client & server.
 */
export class Events {
  /**
   * Triggered when a team is proposed and should be voted on
   */
  static readonly TEAM_VOTE = event<{ team: string }, { vote: boolean }>(
    "team_vote",
  );
}
