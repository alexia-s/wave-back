const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Extrait le token JWT depuis l'en-tête "Authorization: Bearer <TOKEN>"
    const token = req.headers.authorization.split(' ')[1];

    // Décode et vérifie la validité du token à l'aide de la clé secrète
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Extrait le userId contenu dans le token décodé
    const userId = decodedToken.userId;

    // Transmet le userId à l'objet de requête pour qu'il soit accessible dans les contrôleurs
    req.auth = { userId };

    // Passe à l'exécution du middleware ou du contrôleur suivant
    next();
  } catch (error) {
    // Si le token est invalide ou expiré, rejette immédiatement la requête
    res.status(401).json({ message: 'Requête non authentifiée !' });
  }
};