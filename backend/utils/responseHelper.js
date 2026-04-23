/**
 * Standard API response helpers
 */

const success = (res, data = null, message = 'Operation successful', statusCode = 200, meta = null) => {
  const response = {
    success: true,
    data,
    message,
  };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const created = (res, data = null, message = 'Resource created successfully') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const badRequest = (res, message = 'Bad request', errors = null) => {
  return error(res, message, 400, errors);
};

const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, 401);
};

const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, 403);
};

const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

const tooManyRequests = (res, message = 'Too many requests, please try again later') => {
  return error(res, message, 429);
};

module.exports = {
  success,
  created,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
};
