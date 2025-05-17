import { httpServer } from "./src/http_server/index.js";
import { startWsServer } from "./src/back/server/ws_server";

const HTTP_PORT = 8181;
const PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

startWsServer(PORT);
