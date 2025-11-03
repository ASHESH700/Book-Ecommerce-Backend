import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import UserTable from "../user/user.model.js";
import ProductTable from "./product.model.js";
import validateReqBody from "../middleware/validate.req.body.js";
import { productSchema } from "./product.validation.js";
import { paginationSchema } from "../shared/pagination.schema.js";
import { validateMongoIdFromReqParams } from "../middleware/validate.mongoid.js";

const router = express.Router();

//* Add product by seller
router.post(
  "/product/add",
  validateReqBody(productSchema),
  async (req, res) => {
    // Extract product detail from req.body
    const newProduct = req.body;

    // extract token from req.headers
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send({ message: "AccessToken is necessary" });
    }

    // Extract payload from token by decryption
    let payload = null;

    try {
      const secretKey = "sd973bnirkj4r87";
      payload = jwt.verify(token, secretKey);
    } catch (error) {
      return res.status(400).send({ message: "AccessToken doesn't match" });
    }

    if (!payload.email) {
      return res
        .status(400)
        .send({ message: "Token payload is missing email" });
    }

    const user = await UserTable.findOne({ email: payload.email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.role !== "seller") {
      return res.status(401).send({ message: "Role must be seller" });
    }

    //Get sellerId from user
    const sellerId = user.id;

    //Create product
    await ProductTable.create({ ...newProduct, sellerId });

    return res.status(201).send({
      message: "Product Added Successfully",
      productDetails: { ...newProduct, sellerId },
    });
  }
);

//* Buyer list
router.post(
  "/product/buyer/list",
  //! Required: Role verification
  validateReqBody(paginationSchema),
  async (req, res) => {
    const paginationData = req.body;

    const page = paginationData.page;
    const limit = paginationData.limit;

    const skip = (page - 1) * limit;

    const products = await ProductTable.aggregate([
      {
        $match: {},
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const totalItems = await ProductTable.find().countDocuments();

    const totalPage = Math.ceil(totalItems / limit);

    return res.status(200).send({
      message: "success",
      productList: products,
      totalPage,
    });
  }
);

//* Seller list
router.post(
  "/product/seller/list",
  validateReqBody(paginationSchema),
  async (req, res) => {
    const paginationData = req.body;

    const page = paginationData.page;
    const limit = paginationData.limit;

    const skip = (page - 1) * limit;

    // Get token
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // decode token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET); // decode token
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // get userId from payload
    const userId = new mongoose.Types.ObjectId(payload.id); // convert string to ObjectId

    // Check if user is actually a seller
    const user = await UserTable.findById(userId);
    if (!user || user.role !== "seller") {
      return res.status(403).json({ message: "Access denied. Not a seller." });
    }

    const products = await ProductTable.aggregate([
      {
        $match: { sellerId: userId },
      },
      {
        $skip: skip,
      },
      { $limit: limit },
    ]);

    const totalItems = await ProductTable.countDocuments({ sellerId: userId });
    const totalPage = Math.ceil(totalItems / limit);

    return res.status(200).json({
      message: "success",
      productList: products,
      totalPage,
    });
  }
);

//* Get product details
router.get(
  "/product/detail/:id",
  validateMongoIdFromReqParams,
  async (req, res) => {
    const productId = req.params.id;

    //* Searching for product using id
    const product = await ProductTable.find({ _id: productId });

    if (!product) {
      return res.status(400).send({ message: "Product not found" });
    }

    return res
      .status(200)
      .send({ message: "Product found Successfully", productDetail: product });
  }
);

//* Delete product
router.delete(
  "/product/delete/:id",
  //! Required: Role verification and ownership of product
  validateMongoIdFromReqParams,
  async (req, res) => {
    const productId = req.params.id;

    await ProductTable.deleteOne({ _id: productId });

    return res.status(200).send({ message: "Successfully deleted" });
  }
);

//* Update product
router.put(
  "/product/edit/:id",
  //! Required: Role verification and ownership of product
  //! Required: Yup validation
  validateMongoIdFromReqParams,
  async (req, res) => {
    const productId = req.params.id;

    const updatedValues = req.body;

    await ProductTable.updateOne(
      { _id: productId },
      { $set: { ...updatedValues } }
    );

    return res.status(200).send({ message: "Product is updated successfully" });
  }
);
export { router as productController };
