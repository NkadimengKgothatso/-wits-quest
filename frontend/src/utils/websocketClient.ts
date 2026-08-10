import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3000';

class WebSocketClient {
  private socket: Socket | null = null;

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log(`[WebSocketClient] Connected to battle server: ${this.socket?.id}`);
      });

      this.socket.on('disconnect', () => {
        console.log('[WebSocketClient] Disconnected from battle server');
      });
    }

    return this.socket;
  }

  public joinRoom(matchId: string, userId: string, username: string) {
    const s = this.connect();
    s.emit('join_battle', { matchId, userId, username });
  }

  public submitTurn(matchId: string, userId: string, cardId: string, stat: string) {
    const s = this.connect();
    s.emit('submit_turn', { matchId, userId, cardId, stat });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const battleSocketClient = new WebSocketClient();
