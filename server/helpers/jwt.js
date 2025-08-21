require("dotenv").config();
const jwt = require("jsonwebtoken");

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // Provide a clear error in production, fallback in development for convenience.
  if (process.env.NODE_ENV === 'production') {
    const err = new Error('JWT_SECRET environment variable is not set');
    err.name = 'ConfigError';
    throw err;
  } else {
    JWT_SECRET = 'devsecret'; // fallback so dev doesn\'t 500 silently
  }
}

const signToken = (data) => {
  return jwt.sign(data, JWT_SECRET);
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken,
};
