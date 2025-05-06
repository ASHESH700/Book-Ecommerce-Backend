import express from "express";
import bcrypt from "bcrypt";
import UserTable from "./user.model.js";

const router = express.Router();

router.post("/user/register", async (req, res) => {
  const newUser = req.body;

  // Hash password to store in DB
  const plainPassword = newUser.password;
  const saltRound = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRound);

  // Replace plainPassword with hashedPassword
  newUser.password = hashedPassword;

  const user = await UserTable.findOne({ email: newUser.email });

  // if user exists, throw error
  if (user) {
    return res.status(409).send({ message: "User already exists." });
  }

  await UserTable.create(newUser);

  return res.status(201).send({ message: "User is registered successfully" });
});

export { router as userController };
