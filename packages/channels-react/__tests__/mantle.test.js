"use strict";

const mantle = require("../dist");
const assert = require("assert").strict;

assert.strictEqual(mantle(), "Hello from mantle");
console.info("mantle tests passed");
