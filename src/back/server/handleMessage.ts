import { controller } from "../controller/controller";
import type { RawData, WebSocket } from "ws";
import { parseRaw } from "../utils/utils";
import { IRequest, IResponse } from "../types";

export const handleMessage = (message: RawData, ws: WebSocket) => {
  const messageData = parseRaw(message);
  if (messageData.type === "reg") {
    controller.authorizeUser(messageData, ws);
  } else {
    privateHandleMessage(messageData, ws);
  }
};

const privateHandleMessage = (message: IRequest, ws: WebSocket) => {
  const messageData: IResponse | null = null;
  if (!controller.checkIsAuthorized(ws)) {
    return;
  }
  switch (message.type) {
    case "add_ships": {
      controller.addShips(message, ws);
      break;
    }

    case "add_user_to_room": {
      controller.addUserToRoom(message.data.indexRoom.toString(), ws);
      break;
    }

    case "create_room": {
      controller.createRoom(ws);
      break;
    }

    case "attack":
      break;
    case "randomAttack":
      break;
    default:
      break;
  }
  return messageData;
};
