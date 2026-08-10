import { Server, Socket } from 'socket.io';

interface LiveRoomPlayer {
  socketId: string;
  userId: string;
  username: string;
  score: number;
  submittedTurn?: {
    cardId: string;
    cardName: string;
    stat: string;
    statVal: number;
  };
}

interface LiveBattleRoom {
  matchId: string;
  players: LiveRoomPlayer[];
  spectators: string[];
  currentRound: number;
  maxRounds: number;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
}

const activeRooms: Map<string, LiveBattleRoom> = new Map();

/**
 * Initializes real-time Socket.io battle room event handlers.
 */
export function setupBattleSocketHandler(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io Battle Handler] Player connected: ${socket.id}`);

    // 1. Join or create a battle room
    socket.on('join_battle', (data: { matchId: string; userId: string; username: string }) => {
      const { matchId, userId, username } = data;
      socket.join(matchId);

      let room = activeRooms.get(matchId);
      if (!room) {
        room = {
          matchId,
          players: [],
          spectators: [],
          currentRound: 1,
          maxRounds: 5,
          status: 'WAITING',
        };
        activeRooms.set(matchId, room);
      }

      // Check if user is player or spectator
      const existingPlayer = room.players.find((p) => p.userId === userId);
      if (!existingPlayer && room.players.length < 2) {
        room.players.push({
          socketId: socket.id,
          userId,
          username: username || 'Player',
          score: 0,
        });
      } else if (!existingPlayer) {
        room.spectators.push(socket.id);
      }

      if (room.players.length === 2 && room.status === 'WAITING') {
        room.status = 'PLAYING';
        io.to(matchId).emit('battle_start', {
          message: 'Match started! Both players connected.',
          players: room.players.map((p) => ({ userId: p.userId, username: p.username })),
        });
      }

      io.to(matchId).emit('room_state_update', {
        playerCount: room.players.length,
        spectatorCount: room.spectators.length,
        players: room.players.map((p) => ({ userId: p.userId, username: p.username })),
      });
    });

    // 2. Submit secret turn pick with card details & stat value
    socket.on(
      'submit_turn',
      (data: { matchId: string; userId: string; cardId: string; cardName?: string; stat: string; statVal: number }) => {
        const { matchId, userId, cardId, cardName, stat, statVal } = data;
        const room = activeRooms.get(matchId);
        if (!room || room.status !== 'PLAYING') return;

        const player = room.players.find((p) => p.userId === userId);
        if (player) {
          player.submittedTurn = {
            cardId,
            cardName: cardName || 'Card',
            stat,
            statVal,
          };
        }

        // Check if both players locked in secret picks
        const allSubmitted = room.players.every((p) => p.submittedTurn !== undefined);
        if (allSubmitted && room.players.length === 2) {
          const p1 = room.players[0];
          const p2 = room.players[1];

          // Simultaneous dual reveal event broadcast to all clients in match
          io.to(matchId).emit('round_outcome', {
            roundNumber: room.currentRound,
            player1Turn: {
              userId: p1.userId,
              username: p1.username,
              cardId: p1.submittedTurn?.cardId,
              cardName: p1.submittedTurn?.cardName,
              stat: p1.submittedTurn?.stat,
              statVal: p1.submittedTurn?.statVal,
            },
            player2Turn: {
              userId: p2.userId,
              username: p2.username,
              cardId: p2.submittedTurn?.cardId,
              cardName: p2.submittedTurn?.cardName,
              stat: p2.submittedTurn?.stat,
              statVal: p2.submittedTurn?.statVal,
            },
          });

          // Reset turn submissions for next round
          p1.submittedTurn = undefined;
          p2.submittedTurn = undefined;
          room.currentRound += 1;
        }
      }
    );

    // 3. Disconnect resilience
    socket.on('disconnect', () => {
      console.log(`[Socket.io Battle Handler] Player disconnected: ${socket.id}`);
      activeRooms.forEach((room, matchId) => {
        const pIdx = room.players.findIndex((p) => p.socketId === socket.id);
        if (pIdx !== -1) {
          io.to(matchId).emit('player_disconnected', {
            userId: room.players[pIdx].userId,
            message: 'Opponent disconnected.',
          });
        }
      });
    });
  });
}
