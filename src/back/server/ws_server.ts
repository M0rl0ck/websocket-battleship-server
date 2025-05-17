import { WebSocketServer, type RawData } from "ws";
import type { IRequest, IResponse } from "../types";
import { handleMessage } from "./handleMessage";
import { usersDB } from "../db";

type IRequestData = {
  type: string;
  data: string;
  id: 0;
};

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
      const messageData = parseRaw(message);
      const responseMessage = handleMessage(messageData, ws);
      if (!responseMessage) {
        return;
      }
      ws.send(createRaw(responseMessage));
    });
    ws.on("close", () => {
      usersDB.unauthorizeUser(ws);
    });
  });
  console.log(`Start server on the ${port} port!`);
  return wss;
};

const parseRaw = (raw: RawData) => {
  console.log(raw.toString());
  const messageData = JSON.parse(raw.toString());
  messageData.data = JSON.parse(messageData.data);
  return messageData as IRequest;
};

const createRaw = (message: IResponse) => {
  const data: IRequestData = {
    type: message.type,
    data: JSON.stringify(message.data),
    id: message.id,
  };
  console.log(data);
  return JSON.stringify(data);
};

export { startWsServer };
