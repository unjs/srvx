import { createServer } from "node:http";

const server = createServer((_req, res) => {
  res.end("Hello!");
});

server.listen(3000);
