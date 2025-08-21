function errorHandler(error, req, res, next) {
  let status = 500;
  let message = "Internal Server Error";

  switch (error.name) {
    case "SequelizeValidationError":
      status = 400;
      message = error.errors[0].message;
      break;
    
    case "SequelizeUniqueConstraintError":
      status = 400;
      message = error.errors[0].message;
      break;
    
    case "BadRequest":
      status = 400;
      message = error.message;
      break;
    
    case "Unauthorized":
      status = 401;
      message = error.message;
      break;
    
    case "Forbidden":
      status = 403;
      message = error.message;
      break;
    
    case "NotFound":
      status = 404;
      message = error.message;
      break;
    case "ConfigError":
      status = 500;
      message = error.message;
      break;
    
    case "JsonWebTokenError":
      status = 401;
      message = "Invalid token";
      break;
    
    case "TokenExpiredError":
      status = 401;
      message = "Token expired";
      break;
    
    default:
      console.error("Unhandled error:", error);
      status = 500;
      message = error.message || "Internal Server Error";
      break;
  }

  res.status(status).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}

module.exports = errorHandler;
