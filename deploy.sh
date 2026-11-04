#!/bin/bash
# Script de déploiement de l'application Wave

# Arrête le script dès qu'une commande échoue
set -e

echo "=== Début du déploiement de Wave ==="

# Étape 1 : récupérer la dernière version du code depuis GitHub
echo "1. Récupération du code..."
git pull origin main

# Étape 2 : vérifier que le fichier .env existe
echo "2. Vérification des variables d'environnement..."
if [ ! -f .env ]; then
  echo "ERREUR : le fichier .env est manquant."
  echo "Créez-le à partir du modèle .env.example"
  exit 1
fi

# Étape 3 : installer les dépendances
echo "3. Installation des dépendances..."
npm install --omit=dev

# Étape 4 : vérifier les failles de sécurité
echo "4. Audit de sécurité..."
npm audit --audit-level=high

# Étape 5 : lancer les tests
echo "5. Lancement des tests..."
npm test

# Étape 6 : démarrer l'application
echo "6. Démarrage de l'application..."
npm start