const express = require('express');
const cors = require('cors'); // Import du middleware CORS pour autoriser les requêtes cross-origin
const path = require('path');
const connectDB = require('./config/db'); // Fonction pour initialiser la connexion à la base de données MongoDB Atlas

// Importation des fichiers de routage pour séparer la logique de l'application
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');

// Initialisation de l'application Express
const app = express();

// Connexion à la base de données MongoDB
connectDB();

// Activation du middleware CORS pour autoriser toutes les requêtes inter-origines
app.use(cors());

// Middleware global : permet à Express d'analyser le corps des requêtes arrivant au format JSON (req.body)
app.use(express.json());

// Middleware statique : rend le dossier local '/images' accessible publiquement pour afficher les couvertures des livres
app.use ('/images', express.static(path.join(__dirname, 'images')));

// Enregistrement des routes principales de l'API
app.use('/api/auth', userRoutes); // Enregistre les endpoints d'authentification (/signup, /login)
app.use('/api/books', bookRoutes); // Enregistre les endpoints d'opération sur les livres (CRUD + likes)

// Route racine (Health Check) : permet de vérifier que le serveur tourne correctement
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API Wave fonctionnelle !' });
});

// Exporte l'application Express pour l'utiliser dans server.js
module.exports = app;