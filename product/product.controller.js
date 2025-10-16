import express from "express";
import jwt from "jsonwebtoken";
import UserTable from "../user/user.model.js";
import ProductTable from "./product.model.js";

const router = express.Router();

// ! Remaining to add error messages
router.post("/product/add", async (req, res) => {
  // Extract product detail from req.body
  const newProduct = req.body;

  // extract token from req.headers
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  // Extract payload from token by decryption
  let payload = null;

  try {
    const secretKey = "sd973bnirkj4r87";
    payload = jwt.verify(token, secretKey);
  } catch (error) {
    return res.status(400).send({ message: "Unauthorized" });
  }

  if (!payload.email) {
    return res.status(400).send({ message: "Token payload missing email" });
  }

  const user = await UserTable.findOne({ email: payload.email });

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  //Get sellerId from user
  const sellerId = user.id;

  //Create product
  await ProductTable.create({ ...newProduct, sellerId });

  return res.status(201).send({
    message: "Product Added Successfully",
    productDetails: { ...newProduct, sellerId },
  });
});

export { router as productController };
