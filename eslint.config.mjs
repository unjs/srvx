import unjs from "eslint-config-unjs";

export default unjs({
  ignores: ["**/.docs"],
  rules: {
    "unicorn/no-null": "off",
    "unicorn/no-nested-ternary": "off",
    "unicorn/prefer-top-level-await": "off",
  },
});
