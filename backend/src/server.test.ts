import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { io as Client } from "socket.io-client";
import initSqlJs from "sql.js";
import { ensureLegacyUserColumns } from "./db/schema.js";

describe("Backend Server API & Sockets", () => {
  it("adds missing avatar and user columns to legacy databases", async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    db.run(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        studentNumber TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        lastCheckInDate TEXT NOT NULL
      );
    `);

    ensureLegacyUserColumns(db);

    const tableInfo = db.exec("PRAGMA table_info(users);");
    const columns = tableInfo[0]?.values.map((row: any[]) => row[1]) ?? [];

    expect(columns).toContain("avatar");
    expect(columns).toContain("role");
    expect(columns).toContain("level");
  });

  let httpServerProcess: any;

  beforeAll(async () => {
    // Dynamically import the server to start it
    await import("./server.js");
    // Give it a moment to start up
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  afterAll(() => {
    // In a real app we'd export the server to cleanly close it,
    // but process.exit will naturally close it at the end of tests.
  });

  it("GET /api/health should return ok status", async () => {
    const response = await fetch("http://localhost:3000/api/health");
    expect(response.status).toBe(200);

    const data = (await response.json()) as any;
    expect(data.status).toBe("ok");
    expect(data.service).toBe("Wits Quest API Backend");
    expect(data.timestamp).toBeDefined();
  });

  it("Socket.IO should connect and join battle", (done) => {
    return new Promise<void>((resolve) => {
      const clientSocket = Client("http://localhost:3000");

      clientSocket.on("connect", () => {
        expect(clientSocket.connected).toBe(true);
        clientSocket.emit("join_battle", { matchId: "test-match-123" });

        // Wait a small amount of time for the server to process the emit
        setTimeout(() => {
          clientSocket.disconnect();
          resolve();
        }, 100);
      });
    });
  });
});
