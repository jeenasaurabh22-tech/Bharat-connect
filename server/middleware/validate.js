import ApiError from '../utils/ApiError.js';
const validate = (schema) => (req, res, next) => {
  try {
    const validData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = validData.body;
    req.query = validData.query;
    req.params = validData.params;
    return next();
  } catch (error) {
    const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    return next(new ApiError(400, `Validation Failed: ${errorMessages}`));
  }
};
export default validate;