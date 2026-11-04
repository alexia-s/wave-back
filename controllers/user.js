const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- INSCRIPTION D'UN NOUVEL UTILISATEUR (POST /api/auth/signup) ---
exports.signup = async (req, res, next) => {
  try {
    // Extrait le nom, l'email et le mot de passe depuis le corps de la requête
    const { name, email, password } = req.body;

    // Validation de sécurité : vérifie la présence et la longueur minimale du mot de passe
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    // Hachage du mot de passe avec bcrypt (10 tours pour la sécurité)
    const hash = await bcrypt.hash(password, 10);

    // Instanciation d'un nouveau modèle User avec l'empreinte hachée du mot de passe
    const user = new User({
      name,
      email,
      password: hash
    });

    // Enregistrement du nouvel utilisateur dans la base de données MongoDB
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès !' });
  } catch (error) {
    // Gestion des erreurs serveur ou d'unicité (ex: email déjà utilisé)
    res.status(500).json({ error });
  }
};

// --- CONNEXION D'UN UTILISATEUR (POST /api/auth/login) ---
exports.login = async (req, res, next) => {
  try {
    // Extrait les identifiants de la requête
    const { email, password } = req.body;

    // Recherche de l'utilisateur dans MongoDB via son adresse email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Comparaison du mot de passe en clair saisi avec le hash stocké en base de données
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Authentification réussie : signature et renvoi du jeton JWT (valable 24h)
    res.status(200).json({
      userId: user._id,
      token: jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,// Clé secrète issue des variables d'environnement
        { expiresIn: '24h' }
      )
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};