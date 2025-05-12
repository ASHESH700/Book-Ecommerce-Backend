import express from "express";
import bcrypt from "bcrypt";
import UserTable from "./user.model.js";
import jwt from "jsonwebtoken";
import { loginCredentialSchema, registerUserSchema } from "./user.validation.js";

const router = express.Router();

router.post(
  "/user/register",
  async (req, res, next) => {
    try {
      const validatedData = await registerUserSchema.validate(req.body);

      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    // extract new user from req.body
    const newUser = req.body;

    // find user with email
    // if false returns null
    const user = await UserTable.findOne({ email: newUser.email });

    // if user, throw error
    if (user) {
      return res.status(409).send({ message: "User already exists." });
    }

    // Hash password to store in DB
    const plainPassword = newUser.password;
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRound);

    // Replace plainPassword with hashedPassword
    newUser.password = hashedPassword;

    // create user
    await UserTable.create(newUser);

    return res.status(201).send({ message: "User is registered successfully" });
  }
);

router.post(
  "/user/login",
  async (req, res, next) => {
    try {
      const validatedData = await loginCredentialSchema.validate(req.body);

      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    // Extract loginCredentials from req.body
    const loginCredentials = req.body;

    // find user with provided email
    const user = await UserTable.findOne({ email: loginCredentials.email });

    // if not user, throw error
    if (!user) {
      return res.status(404).send({ message: "User is not registered" });
    }

    // check for password match
    // requirement: plain password, hashed password
    const plainPassword = loginCredentials.password;
    const hashedPassword = user.password;
    const isPasswordMatch = await bcrypt.compare(plainPassword, hashedPassword);

    if (!isPasswordMatch) {
      return res.status(404).send({ message: "Invalid Credentials" });
    }

    // generate token
    // jsonwebtoken is used to encrypt decrypt tokens
    // payload => object inside token
    // token is wrapping up payload using secretKey
    const payload = { email: user.email, id: user._id };
    const secretKey = process.env.JWT_SECRET || "defaultSecretKey"; // Use environment variables

    const token = jwt.sign(payload, secretKey, {
      expiresIn: "7d",
    });

    // Remove password before sending user details
    const { password, ...userDetails } = user.toObject();

    return res
      .status(200)
      .send({ message: "Login successful", accessToken: token, userDetails });
  }
);

export { router as userController };
