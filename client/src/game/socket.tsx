import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

const SOCKET_URL = (process.env.NODE_ENV == 'development')
    ? 'http://localhost:5050'
    : 'http://45.55.60.192:5050';

/**
 * Acquires a socket connection to the server
 */
export function acquireSocket(lobby_id: string, token: string): SocketIOClient.Socket {
    const sock = io.connect(SOCKET_URL, {
        query: {
            lobby: lobby_id,
            token: token,
        }
    });

    return sock;
}
