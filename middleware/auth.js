const jwt = require('jsonwebtoken');

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Unauthorized. Please add valid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Support multiple token payload shapes (id, userId, _id)
    const userId = decoded.id || decoded.userId || decoded._id;
    const name = decoded.name || decoded.username || decoded.email || null;

    if (!userId) {
      return res.status(401).json({ msg: 'Unauthorized. Invalid token payload' });
    }

    req.user = { userId, name };
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Unauthorized. Please add valid token' });
  }
};

module.exports = authenticationMiddleware;