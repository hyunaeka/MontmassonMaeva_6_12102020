const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // On récupére le Token 
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // On décode pour récupérer le Token
    const userId = decodedToken.userId; // On récupére l'ID utilisateur pour comparer à celui du Token
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};