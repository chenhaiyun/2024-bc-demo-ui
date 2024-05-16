import { io } from "socket.io-client";
import { WEBSOCKET_URL } from "./utils";
export const socket = io(WEBSOCKET_URL, {
  autoConnect: true,
});
