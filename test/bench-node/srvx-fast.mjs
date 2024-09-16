import { serve } from "srvx";
import { NodeFastResponse } from "srvx/node-utils";

const server = await serve({
  port: 3000,
  fetch() {
    return new NodeFastResponse("Hello!");
  },
});

await server.ready();
