import {
  createUser,
  deleteUser,
  forgotPassword,
  getAllUsers,
  getUser,
  loginUser,
  resetPassword,
  updateUser,
} from "./app";

import express from "express";

import { jwtDecoder } from "@www/custom.middelewares";

export const userRouter = express.Router();

userRouter.route("/register").post(createUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/forgotPassword").post(forgotPassword);
userRouter.route("/resetPassword").post(resetPassword);

// Requires Authentication
userRouter.use(jwtDecoder);
userRouter.route("/list").get(getAllUsers);
userRouter.route("/").get(getUser).patch(updateUser).delete(deleteUser);
