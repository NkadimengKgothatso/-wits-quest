import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as Client } from 'socket.io-client';

describe('Backend Server API & Sockets', () => {
  let httpServerProcess: any;

  beforeAll(async () => {
    // Dynamically import the server to start it
    await import('./server');
    // Give it a moment to start up
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  afterAll(() => {
    // In a real app we'd export the server to cleanly close it,
    // but process.exit will naturally close it at the end of tests.
  });

  it('GET /api/health should return ok status', async () => {
    const response = await fetch('http://localhost:3000/api/health');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('Wits Quest API Backend');
    expect(data.timestamp).toBeDefined();
  });

  it('Socket.IO should connect and join battle', (done) => {
    return new Promise<void>((resolve) => {
      const clientSocket = Client('http://localhost:3000');
      
      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        clientSocket.emit('join_battle', { matchId: 'test-match-123' });
        
        // Wait a small amount of time for the server to process the emit
        setTimeout(() => {
          clientSocket.disconnect();
          resolve();
        }, 100);
      });
    });
  });
});
