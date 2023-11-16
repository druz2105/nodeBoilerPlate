import mongoose from "mongoose";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import sgMail from "@sendgrid/mail";
import env from "@lib/env";
import {
  CreateUserInterface,
  UpdateUserInterface,
  UserLoginInterface,
  UserModelInterface,
} from "@lib/interfaces/users/userModel";

sgMail.setApiKey(env.SENDGRID_KEY);

const userSchema = new mongoose.Schema<UserModelInterface>({
  username: {
    type: String,
    required: [true, "A user must have username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "A user must have email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "A user must have password"],
  },
  fistName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
    immutable: true,
  },
  lastLogin: {
    type: Number,
    default: null,
  },
});

const UserModel = mongoose.model("User", userSchema);

export default class UserService {
  filterableFields = ["name", "email", "first_name", "last_name", "createdAt"];

  createUser = async (data: CreateUserInterface) => {
    data.email = data.email.toLowerCase();
    const oldUserEmail = await UserModel.findOne({ email: data.email });
    const oldUserUserName = await UserModel.findOne({
      username: data.username,
    });

    if (oldUserEmail) {
      throw { message: "User with this Email Already Exist. Please Login" };
    }
    if (oldUserUserName) {
      throw {
        message: "User with this Username Already Exist. Please Login",
      };
    }
    data.password = this.createPassword(data.password);
    return UserModel.create(data);
  };

  createJWTToken = (data: UserModelInterface) => {
    let date = new Date();
    if (data.lastLogin) {
      date = new Date(data.lastLogin);
    }
    const epochTimeInMilliseconds = date.getTime();
    const epochTimeInSeconds = Math.floor(epochTimeInMilliseconds / 1000);
    return jwt.sign(
      { user_id: data._id, email: data.email, lastLogin: epochTimeInSeconds },
      env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
  };

  loginUser = async (data: UserLoginInterface) => {
    let user: UserModelInterface | null | undefined = undefined;
    if (data.email) {
      data.email = data.email.toLowerCase();
      user = await UserModel.findOne({ email: data.email });
    } else if (data.username) {
      user = await UserModel.findOne({ username: data.username });
    }
    if (!user) {
      throw {
        message: "User not found, make sure Email or Username is correct",
      };
    } else {
      const checkValid = this.checkPassword(data.password, user.password);
      if (checkValid) {
        if (!user.active) {
          throw { message: "User not verified, check email for verification!" };
        }
        user.lastLogin = new Date().getTime();
        await user.save();
        user.jwtToken = this.createJWTToken(user);
      } else {
        throw {
          message:
            "User not valid, make sure Email or Username and Password is correct",
        };
      }
    }
    return user;
  };

  createPassword = (password: string) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  };

  checkPassword = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
  };

  sendVerificationEmail = async (user: UserModelInterface) => {
    const verificationLink = `${env.VERIFICATION_LINK}${user._id.toString()}`;
    const msg = {
      to: user.email,
      from: env.SEND_EMAIL,
      subject: "Verify User Account",
      templateId: env.VERIFY_ACCOUNT_TEMPLATE,
      dynamicTemplateData: {
        fullName: user.username,
        verificationLink: verificationLink,
      },
    };
    await sgMail.send(msg);
  };

  sendResetPasswordEmail = async (user: UserModelInterface) => {
    const jwtToken = jwt.sign(
      {
        user_id: user._id,
      },
      env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    const passwordResetLink = `${env.RESET_PASSWORD_LINK}${jwtToken}`;
    const msg = {
      to: user.email,
      from: env.SEND_EMAIL,
      subject: "Reset Password Account",
      templateId: env.RESET_PASSWORD_TEMPLATE,
      dynamicTemplateData: {
        passwordResetLink: passwordResetLink,
      },
    };
    await sgMail.send(msg);
  };
  getById = (id: string) => {
    return UserModel.findById(id);
  };

  filterUsers = async (
    data: UserModelInterface,
    request: Record<string, any>
  ) => {
    let queryData;
    for (const key in data) {
      if (!this.filterableFields.includes(key)) {
        delete data[key];
      }
    }
    let dataString = JSON.stringify(data);
    data = JSON.parse(
      dataString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );
    queryData = UserModel.find(data);

    if (request.query.sort) {
      queryData = this.sortData(
        queryData,
        request.query.sort.split(",").join(" ")
      );
    } else {
      queryData = this.sortData(queryData, "createdAt");
    }

    if (request.query.fields) {
      queryData = this.limitFields(
        queryData,
        request.query.fields.split(",").join(" ")
      );
    }
    const page = request.query.page * 1 || 1;
    const limit = request.query.limit * 1 || 10;
    queryData = this.paginateData(queryData, page, limit);
    const paginatedData = await queryData;
    const count = await UserModel.countDocuments(data);
    const skip = page * limit;
    const nextPage = skip < count ? page + 1 : null;
    const previousPage = page - 1 === 0 ? null : page - 1;
    return {
      paginatedData: paginatedData,
      nextPage: nextPage,
      previousPage: previousPage,
      count: count,
    };
  };

  findById = async (id: string) => {
    return UserModel.findById(id);
  };

  findByEmail = async (email: string) => {
    return UserModel.findOne({ email: email });
  };

  findAndUpdatePassword = async (id: string, password: string) => {
    password = this.createPassword(password);
    return UserModel.findByIdAndUpdate(
      id,
      { password: password },
      { new: true, runValidators: true }
    );
  };

  findAndUpdateUserData = async (id: string, data: UpdateUserInterface) => {
    if (data.password) {
      delete data.password;
    }
    if (data.email) {
      data.email = data.email.toLowerCase();
      const oldUserEmail = await UserModel.findOne({ email: data.email });
      if (oldUserEmail && !oldUserEmail._id.equals(id)) {
        throw { message: "User with this Email Already Exist. Please Login" };
      }
    }
    if (data.username) {
      const oldUserUserName = await UserModel.findOne({
        username: data.username,
      });
      if (oldUserUserName && !oldUserUserName._id.equals(id)) {
        throw {
          message: "User with this Username Already Exist. Please Login",
        };
      }
    }
    return UserModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  };

  findAndDelete = (id: string) => {
    return UserModel.findByIdAndDelete(id);
  };

  sortData = (query: any, key = "createdAt") => {
    return query.sort(key);
  };

  limitFields = (query: any, fields = this.filterableFields) => {
    return query.select(fields);
  };

  paginateData(query: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  }
}
