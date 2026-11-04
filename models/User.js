const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator').default;

// Définition du schéma de données pour la collection 'users'
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // unique: true empêche les inscriptions en double
  password: { type: String, required: true } // Stocke le mot de passe haché par bcrypt
});

// Applique le plugin de validation d'unicité pour renvoyer une erreur propre si l'email existe déjà
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);