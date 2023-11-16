import express from "express";
import morgan from "morgan";
import { camelCaseParser } from "@www/custom.middelewares";
import { userRouter } from "../src/users/routers";

export const app = express();
app.use(express.json());
app.use(express.static("./public"));
app.use(camelCaseParser);
app.use(morgan("dev"));
app.use("/api/v1/user", userRouter);
