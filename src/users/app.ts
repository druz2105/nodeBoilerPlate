import UserService from "./models";

import url from "url";
import fs from "fs";
import jwt, { JwtPayload } from "jsonwebtoken";
import env from "@lib/env";

const userService = new UserService();
export const getAllUsers = async (request, response) => {
  try {
    const queryLength = Object.keys(request.query).length;
    let data = await userService.filterUsers(
      queryLength === 0 ? {} : { ...request.query },
      request
    );
    const users = data.paginatedData;
    const nextPage = data.nextPage;
    const previousPage = data.previousPage;
    const count = data.count;
    if (users.length === 0) {
      return response.status(400).json({ status: "Failed", data: [] });
    }
    const usersData = users.map((user) => {
      const {
        email,
        username,
        fistName: firstName,
        lastName: lastName,
        createdAt,
        active,
        _id,
      } = user;
      return { email, username, firstName, lastName, createdAt, active, _id };
    });
    return response.status(200).json({
      status: "Success",
      currentPage: request.query.page * 1 || 1,
      nextPage: nextPage,
      previousPage: previousPage,
      results: count,
      data: usersData,
    });
  } catch (err) {
    return response.status(400).json({ status: "Failed", data: err.message });
  }
};

export const createUser = async (request, response) => {
  try {
    const newUser = await userService.createUser(request.body);
    userService.sendVerificationEmail(newUser);
    const {
      email,
      username,
      fistName: firstName,
      lastName: lastName,
      createdAt,
      active,
      _id,
    } = newUser;
    const data = {
      email,
      username,
      firstName,
      lastName,
      createdAt,
      active,
      _id,
    };
    return response.status(201).json({ status: "Success", data: data });
  } catch (err) {
    return response.status(400).json({ status: "Failed", data: err.message });
  }
};

export const verifyUser = async (request, response) => {
  const parsedUrl = url.parse(request.url);
  const slug = parsedUrl.pathname?.split("/").pop();
  if (!slug) {
    return response.status(400).send("User verification failed");
  }
  const user = await userService.findAndUpdateUserData(slug, { active: true });
  if (user && user.active) {
    fs.readFile("./templates/user-verified.html", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return response.status(500).send("Internal Server Error");
      } else {
        return response.status(200).send(data);
      }
    });
  } else {
    return response.status(400).send("User verification failed");
  }
};

export const loginUser = async (request, response) => {
  try {
    if (!request.body.email && !request.body.username) {
      return response.status(400).send("Email or username is required");
    }

    if (!request.body.password) {
      return response.status(400).send("Password is required");
    }
    const user = await userService.loginUser(request.body);
    const {
      email,
      username,
      fistName,
      lastName,
      createdAt,
      active,
      _id,
      jwtToken,
    } = user;
    const data = {
      email,
      username,
      fistName,
      lastName,
      createdAt,
      active,
      _id,
      jwtToken,
    };
    return response.status(200).json({ status: "Success", data: data });
  } catch (err) {
    console.log(err);
    return response.status(400).json({ status: "Failed", data: err.message });
  }
};

export const forgotPassword = async (request, response) => {
  try {
    const user = await userService.findByEmail(request.body.email);
    if (user === null) {
      return response
        .status(400)
        .json({ status: "Success", data: "User with this email not found!" });
    }
    userService.sendResetPasswordEmail(user);
    return response
      .status(200)
      .json({ status: "Success", data: "Email Sent!" });
  } catch (err) {
    console.log(err);
    return response.status(400).json({ status: "Failed", data: err.message });
  }
};

export const resetPassword = async (request, response) => {
  try {
    if (!request.body.uniqueString) {
      return response.status(400).send("Verification Failed");
    }

    if (!request.body.password) {
      return response.status(400).send("Password is required");
    }
    const decoded = jwt.verify(
      request.body.uniqueString,
      env.TOKEN_KEY
    ) as JwtPayload;
    await userService.findAndUpdatePassword(
      decoded.user_id,
      request.body.password
    );
    return response
      .status(200)
      .json({ status: "Success", data: "Password Changed" });
  } catch (err) {
    console.log(err);
    return response.status(400).json({ status: "Failed", data: err.message });
  }
};

export const getUser = async (request, response) => {
  try {
    const user = await userService.getById(request.user._id);
    if (user === null) {
      return response
        .status(404)
        .json({ status: "Failed", data: "data not found!" });
    }
    const {
      email,
      username,
      fistName: firstName,
      lastName: lastName,
      createdAt,
      active,
      _id,
    } = user;
    const data = {
      email,
      username,
      firstName,
      lastName,
      createdAt,
      active,
      _id,
    };
    return response.status(200).json({ status: "Success", data: data });
  } catch (err) {
    return response.status(400).json({ status: "Failed", data: err.me });
  }
};
export const updateUser = async (request, response) => {
  try {
    const updatedUser = await userService.findAndUpdateUserData(
      request.user._id,
      request.body
    );
    if (updatedUser === null) {
      return response
        .status(404)
        .json({ status: "Failed", data: "data not found!" });
    }
    const {
      email,
      username,
      fistName: firstName,
      lastName: lastName,
      createdAt,
      active,
      _id,
    } = updatedUser;
    const data = {
      email,
      username,
      firstName,
      lastName,
      createdAt,
      active,
      _id,
    };
    return response.status(200).json({ status: "Success", data: data });
  } catch (err) {
    return response.status(400).json({ status: "Failed", data: err.message });
  }
};
export const deleteUser = async (request, response) => {
  try {
    const deleteUser = await userService.findAndDelete(request.user._id);
    if (deleteUser === null) {
      return response
        .status(404)
        .json({ status: "Failed", data: "data not found!" });
    }
    return response.status(204).json({ status: "Success", data: null });
  } catch (err) {
    return response.status(400).json({ status: "Failed", data: err.message });
  }
};
