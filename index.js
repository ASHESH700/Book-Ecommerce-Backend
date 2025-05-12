import express from "express";
import connectDB from "./db.connection.js";
import { userController } from "./user/user.controller.js";
import { productController } from "./product/product.controller.js";

// Backend app
const app = express();

// To make app understand json
app.use(express.json());

// connect database
await connectDB();

// register routes/controller
app.use(userController);
app.use(productController);

// network port
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
