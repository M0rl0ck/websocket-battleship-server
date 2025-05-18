import { createHash } from "node:crypto";
import type { WebSocket } from "ws";

type User = {
  name: string;
  password: string;
};

class UserDB {
  private users: Map<string, User>;
  private authorizedUsers: Map<WebSocket, string>;
  constructor() {
    this.users = new Map();
    this.authorizedUsers = new Map();
  }

  private addUser = ({ name, password }: User) => {
    const pass = createHash("sha256").update(password).digest("hex");
    const newUser = { name, password: pass };
    this.users.set(name, newUser);
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

const usersDB = new UserDB();

export { usersDB };
