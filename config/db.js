const mongoose = require('mongoose'); // Importation de Mongoose pour interagir avec MongoDB

// Fonction asynchrone gérant la connexion à la base de données
const connectDB = async () => {
  try {
    // Connexion à MongoDB Atlas via la chaîne de connexion sécurisée du fichier .env
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connexion à MongoDB réussie !');
  } catch (error) {
    // En cas d'erreur de connexion, affiche l'erreur dans la console
    console.error('Connexion à MongoDB échouée !', error);
    // Arrête immédiatement le processus du serveur avec un code d'échec (1)
    process.exit(1);
  }
};

module.exports = connectDB;