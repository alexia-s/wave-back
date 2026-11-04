const express = require('express');
const router = express.Router();

// Importation des middlewares et contrôleurs
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const bookCtrl = require('../controllers/book');

// --- ROUTES PUBLIQUES (consultation) ---
router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);

// --- ROUTES SÉCURISÉES (nécessitent le token auth) ---
router.post('/', auth, multer, bookCtrl.createBook); // Création avec upload d'image
router.put('/:id', auth, multer, bookCtrl.modifyBook); // Modification
router.delete('/:id', auth, bookCtrl.deleteBook); // Suppression
router.post('/:id/like', auth, bookCtrl.likeBook); // Vote (Like/Dislike)

module.exports = router;