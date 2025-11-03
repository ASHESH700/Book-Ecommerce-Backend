import yup from "yup";


//* Product validation schema
export const productSchema = yup.object({
name : yup.string().required().max(100).trim(),
genre: yup.string().required().max(100).trim(),
price : yup.number(0, "Price must be positive").required(),
quantity : yup.number(1, "Minimum quantity is 1").integer().required(),
freeShipping : yup.boolean().notRequired().default(false),
description : yup.string().max(500).required().min(10).trim(),
}).noUnknown();