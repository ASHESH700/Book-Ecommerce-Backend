import express from "express";

const router = express.Router();

router.post("/product/add", (req, res) => {
  return res.status(201).send({ message: "Product Added Successfully" });
});

export { router as productController };
