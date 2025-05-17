import { usersDB } from "../db";
import type { IRequest, LoginResponse } from "../types";
import type { WebSocket } from "ws";

export const handleMessage = (message: IRequest, ws: WebSocket) => {
  if (message.type === "reg") {
    const result = usersDB.authorizeUser(message.data, ws);
    const messageData: LoginResponse = {
      type: "reg",
      data: {
        name: message.data.name,
        index: message.data.name,
        error: false,
        errorText: "",
      },
      id: 0,
    };
    if (!result) {
      messageData.data.error = true;
      messageData.data.errorText = "Wrong name or password";
    }

    return messageData;
  }
};
