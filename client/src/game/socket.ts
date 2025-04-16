import io from 'socket.io-client';

const SOCKET_URL = (process.env.NODE_ENV == 'development')
    ? 'http://localhost:5050'
    : 'https://escavalon.quest';

/**
 * Acquires a socket connection to the server
 */
export function acquireSocket(lobby_id: string, token: string): SocketIOClient.Socket {
    const sock = io.connect(SOCKET_URL, {
        query: {
            lobby: lobby_id,
            token: token,
        },
        forceNew: true,
    });

    return sock;
}
