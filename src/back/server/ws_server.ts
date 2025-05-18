import { WebSocketServer } from "ws";
import { handleMessage } from "./handleMessage";
import { usersDB } from "../db";

const startWsServer = (port: number) => {
  const wss = new WebSocketServer({ port });

  process.on("SIGINT", () => {
    wss.clients.forEach((client) => {
      usersDB.unauthorizeUser(client);
      client.close();
    });
    process.exit(0);
  });

  wss.on("connection", (ws) => {
    ws.on("error", console.error);
    ws.on("message", (message) => {
      handleMessage(message, ws);
    });
    ws.on("close", () => {
      usersDB.unauthorizeUser(ws);
    });
  });
  console.log(`Start server on the ${port} port!`);
  return wss;
};

export { startWsServer };
