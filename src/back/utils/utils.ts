import type { IRequest, IResponse, IRequestData } from "../types";
import type { RawData } from "ws";

const parseRaw = (raw: RawData) => {
  console.log(raw.toString());
  const messageData = JSON.parse(raw.toString());
  messageData.data = messageData.data
    ? JSON.parse(messageData.data)
    : messageData.data;
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

export { parseRaw, createRaw };
