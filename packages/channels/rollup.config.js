import compiler from "@ampproject/rollup-plugin-closure-compiler";

export default {
  input: "src/index.js",
  output: {
    dir: "dist",
  },
  plugins: [compiler],
};
