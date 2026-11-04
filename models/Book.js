const mongoose = require('mongoose');

// Définition du schéma de données pour la collection 'books' selon le cahier des charges
const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },        // ID Mongoose unique de l'utilisateur créateur
  title: { type: String, required: true },         // Titre du livre
  author: { type: String, required: true },        // Auteur du livre
  publisher: { type: String, required: true },     // Maison d'édition
  category: { type: String, required: true },      // Catégorie littéraire
  review: { type: String, required: true },        // Commentaire/critique de l'utilisateur
  imageUrl: { type: String, required: true },      // URL d'accès à l'image hébergée sur le serveur
  likes: { type: Number, default: 0 },             // Compteur de votes positifs
  dislikes: { type: Number, default: 0 },          // Compteur de votes négatifs
  usersLiked: { type: [String], default: [] },     // Tableau des IDs des utilisateurs ayant liké
  usersDisliked: { type: [String], default: [] }   // Tableau des IDs des utilisateurs ayant disliké
});

module.exports = mongoose.model('Book', bookSchema);