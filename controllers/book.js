const Book = require('../models/Book');
const fs = require('fs');

// --- Obtenir tous les livres (GET) ---
exports.getAllBooks = async (req, res, next) => {
  try {
    // Interroge MongoDB pour récupérer la liste de tous les documents livres
    const books = await Book.find();
    // Renvoie un statut 200 OK avec le tableau de tous les livres
    res.status(200).json(books);
  } catch (error) {
    // En cas d'erreur serveur, renvoie une erreur 500
    res.status(500).json({ error });
  }
};

// --- Obtenir un livre par son ID ---
exports.getOneBook = async (req, res, next) => {
  try {
    // Cherche un livre dans la base de données grâce à l'ID transmis dans l'URL
    const book = await Book.findById(req.params.id);
    if (!book) {
      // Si aucun livre ne correspond à cet ID, renvoie une erreur 404
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    // Renvoie le livre trouvé avec un statut 200 OK
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// --- Ajouter un livre (POST) ---
exports.createBook = async (req, res, next) => {
  try {
    // Convertit la chaîne JSON reçue dans le champ 'book' de la requête form-data en objet JS
    const bookObject = JSON.parse(req.body.book);

    // Supprime les IDs éventuellement générés par le client par mesure de sécurité
    delete bookObject._id;
    delete bookObject._userId;

    // Instancie un nouveau modèle Book avec les données traitées
    const book = new Book({
      ...bookObject, // Injecte title, author, publisher, category, review
      userId: req.auth.userId, // Extrait l'ID de l'utilisateur authentifié depuis le token JWT
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, // Reconstruit l'URL complète de l'image stockée
      likes: 0, // Initialise les conteneurs de votes
      dislikes: 0,
      usersLiked: [],
      usersDisliked: []
    });

    // Enregistre le nouveau document dans la base MongoDB Atlas
    await book.save();
    res.status(201).json({ message: 'Livre enregistré !' });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// --- Modifier un livre (PUT) ---
exports.modifyBook = async (req, res, next) => {
  try {
    // Vérifie si un nouveau fichier image a été téléversé dans la requête
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId; // Sécurisation du userId

    // Récupère le livre original en base pour vérifier la propriété de la ressource
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Contrôle d'accès : seul l'auteur du livre peut le modifier
    if (book.userId !== req.auth.userId) {
      return res.status(401).json({ message: '404: unauthorized request' });
    }

    // Si une nouvelle image remplace l'ancienne, supprime le fichier physique du dossier /images
    if (req.file && book.imageUrl) {
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {});
    }

    // Met à jour le document MongoDB correspondant à l'ID
    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    res.status(200).json({ message: 'Livre modifié !' });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// --- Supprimer un livre (DELETE) ---
exports.deleteBook = async (req, res, next) => {
  try {
    // Cherche le livre concerné en base de données
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Contrôle d'accès : vérifie que l'utilisateur est bien le propriétaire
    if (book.userId !== req.auth.userId) {
      return res.status(401).json({ message: '404: unauthorized request' });
    }

    // Isole le nom du fichier image pour le supprimer du serveur local
    const filename = book.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, async () => {
      // Une fois le fichier image supprimé sur disque, supprime le document dans MongoDB
      await Book.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: 'Livre supprimé' });
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// --- Gestion des likes et dislikes (POST) ---
exports.likeBook = (req, res, next) => {
  const userId = req.auth.userId; // ID de l'utilisateur qui vote
  const like = req.body.like; // 1 pour un like, 0 pour annuler son vote, -1 pour un dislike

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // CAS 1 : L'utilisateur veut LIKER (like === 1)
      if (like === 1) {
        // On vérifie qu'il n'a pas déjà liké ou disliké
        if (!book.usersLiked.includes(userId) && !book.usersDisliked.includes(userId)) {
          book.likes += 1;
          book.usersLiked.push(userId);
        }
      } 
      // CAS 2 : L'utilisateur veut DISLIKER (like === -1)
      else if (like === -1) {
        // On vérifie qu'il n'a pas déjà liké ou disliké
        if (!book.usersLiked.includes(userId) && !book.usersDisliked.includes(userId)) {
          book.dislikes += 1;
          book.usersDisliked.push(userId);
        }
      } 
      // CAS 3 : L'utilisateur veut ANNULER son vote (like === 0)
      else if (like === 0) {
        // Si l'utilisateur avait précédemment LIKÉ
        if (book.usersLiked.includes(userId)) {
          book.likes -= 1;
          book.usersLiked = book.usersLiked.filter((id) => id !== userId);
        } 
        // Si l'utilisateur avait précédemment DISLIKÉ
        else if (book.usersDisliked.includes(userId)) {
          book.dislikes -= 1;
          book.usersDisliked = book.usersDisliked.filter((id) => id !== userId);
        }
      }

      // On sauvegarde les modifications dans MongoDB
      book.save()
        .then(() => res.status(200).json({ message: 'Vote pris en compte !' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};