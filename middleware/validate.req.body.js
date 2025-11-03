const validateReqBody = (validationSchema) => {
  return async (req, res, next) => {
    try {
      //* validate req.body using yup schema
      const validatedData = await validationSchema.validate(req.body);

      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  };
};

export default validateReqBody;