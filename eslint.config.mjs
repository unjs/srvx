import unjs from "eslint-config-unjs";

export default unjs({
  ignores: ["**/.docs"],
  rules: {
    "unicorn/no-null": "off",
  },
  markdown: {
    rules: {
      // markdown rule overrides
    },
  },
});
