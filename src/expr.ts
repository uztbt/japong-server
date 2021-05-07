import express from "express";

export const expr = express();
expr.use('/test', express.static('test-client'));