export const kNodeReq: unique symbol =
  /* @__PURE__ */ Symbol.for("srvx.node.request");

export const kNodeRes: unique symbol =
  /* @__PURE__ */ Symbol.for("srvx.node.response");

export const kNodeInspect = /* @__PURE__ */ Symbol.for(
  "nodejs.util.inspect.custom",
);

export const kResBody: unique symbol =
  /* @__PURE__ */ Symbol.for("srvx.response.body");

export const kResInit: unique symbol =
  /* @__PURE__ */ Symbol.for("srvx.response.init");
