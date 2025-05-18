import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import type { WebSocket } from "ws";
import type { User } from "../types";

type EventNames = "add_user";

class UsersDB extends EventEmitter {
  private users: Map<string, User>;
  private authorizedUsers: Map<WebSocket, string>;

  emit(event: EventNames, name: string): boolean {
    return super.emit(event, name);
  }

  on(event: EventNames, listener: (name: string) => void) {
    return super.on(event, listener);
  }

  constructor() {
    super();
    this.users = new Map();
    this.authorizedUsers = new Map();
  }

  private addUser = ({ name, password }: User) => {
    const pass = createHash("sha256").update(password).digest("hex");
    const newUser = { name, password: pass };
    this.users.set(name, newUser);
    this.emit("add_user", name);
  };
  private checkUser = ({ name, password }: User) => {
    const pass = createHash("sha256").update(password).digest("hex");
    return this.users.get(name)?.password === pass;
  };

  authorizeUser = ({ name, password }: User, ws: WebSocket) => {
    if (this.authorizedUsers.has(ws)) {
      return true;
    }
    let res: boolean;
    if (this.users.has(name)) {
      res = this.checkUser({ name, password });
    } else {
      this.addUser({ name, password });
      res = true;
    }
    if (res) {
      this.authorizedUsers.set(ws, name);
      console.log(`User ${name} connected`);
    }
    return res;
  };

  unauthorizeUser = (ws: WebSocket) => {
    console.log(`User ${this.authorizedUsers.get(ws)} disconnected`);
    this.authorizedUsers.delete(ws);
  };

  isAuthorized = (ws: WebSocket) => this.authorizedUsers.has(ws);

  getAuthorized = () => [...this.authorizedUsers.keys()];
}

const usersDB = new UsersDB();

export { usersDB };
export type { UsersDB };
