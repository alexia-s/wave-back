const multer = require('multer');

const MIME_TYPES = { // Dictionnaire pour traduire les types MIME reçus en extensions de fichiers
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

// Configuration du stockage de Multer sur le disque local
const storage = multer.diskStorage({
  // Définit le dossier de destination des fichiers téléversés
  destination: (req, file, callback) => {
    callback(null, 'images'); // Sauvegarde dans le dossier /images
  },
  // Définit le nom unique attribué à chaque fichier enregistré
  filename: (req, file, callback) => {
    // Remplace les espaces du nom d'origine par des underscores
    const name = file.originalname.split(' ').join('_').split('.')[0];
    const extension = MIME_TYPES[file.mimetype]; // Récupère l'extension correspondante
    // Génère un nom unique : nom_original + timestamp + .extension
    callback(null, name + '_' + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage: storage }).single('image');