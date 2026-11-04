require('dotenv').config(); // Charge les variables d'environnement du fichier .env (ex: PORT, JWT_SECRET, MONGO_URI)
const http = require('http');
const app = require('./app'); // Importe l'application Express configurée

// Définit le port d'écoute : utilise le port du fichier .env ou le port 3000 par défaut
const PORT = process.env.PORT || 3000;

// Assigne le port à l'application Express
app.set('port', PORT);

// Crée le serveur HTTP en lui passant l'application Express comme gestionnaire de requêtes
const server = http.createServer(app);

// Démarrage du serveur à l'écoute des requêtes entrantes
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});