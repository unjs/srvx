import * as http from "node:http";
import { createRequestListener } from "@mjackson/node-fetch-server";

let server = http.createServer(
  createRequestListener(() => {
    return new Response("Hello!");
  }),
);

server.listen(3000);
