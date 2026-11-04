const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

// Définition des routes publiques d'authentification
router.post('/signup', userCtrl.signup); // Création de compte
router.post('/login', userCtrl.login); // Connexion

module.exports = router;