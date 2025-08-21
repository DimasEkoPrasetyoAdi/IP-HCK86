
const {verifyToken} = require ('../helpers/jwt')

function auth(required = true) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      if (required) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
      }
      req.user = null;
      return next();
    }

    try {
      const payload = verifyToken(token);
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
  };
}

module.exports = { auth };
