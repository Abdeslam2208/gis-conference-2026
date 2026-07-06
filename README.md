# GIS Conference 2026 - Portail d'Inscription & Administration

Ce projet est une application web complète (Frontend + Backend) conçue pour la gestion des inscriptions et la soumission des résumés de communication pour le **GIS USERS CONGRESS 2026**.

Il a été développé avec une architecture légère, autonome et facile à déployer sur les serveurs de la faculté.

---

## 🛠️ Architecture Technique

* **Frontend** : HTML5, CSS3 (Vanilla), JavaScript (ES6).
* **Backend** : Node.js avec le framework léger **Express**.
* **Base de données** : **SQLite** via le module natif de Node.js (`node:sqlite`). Zéro configuration requise, les données sont stockées localement et de façon sécurisée dans le fichier `database.db`.
* **Stockage des documents** : Les fichiers résumés importés par les candidats (PDF, DOCX) sont décodés et stockés localement sur le serveur dans le dossier `uploads/`.

---

## 🚀 Guide d'Installation et de Démarrage

### Prérequis
* **Node.js** (version 22.5.0 ou supérieure requise pour le support natif de SQLite).

### Étape 1 : Récupérer le projet
Décompressez le dossier du projet sur le serveur de destination.

### Étape 2 : Installer les dépendances
Ouvrez un terminal dans le dossier du projet et exécutez :
```bash
npm install
```

### Étape 3 : Lancer l'application
Pour démarrer l'application en mode production ou développement :
```bash
npm start
```

Le serveur démarrera par défaut sur le port **3000** :
* **Portail d'inscription public** : `http://localhost:3000`
* **Tableau de bord d'administration** : `http://localhost:3000/admin.html`

---

## 🔒 Administration du portail

* **Accès** : L'accès au panneau d'administration nécessite un mot de passe.
* **Mot de passe par défaut** : `mri9abdjaj` (il est fortement recommandé de le modifier dans le fichier `admin.html` à la variable `ADMIN_PASSWORD` avant la mise en production).
* **Fonctionnalités** :
  * Visualisation en temps réel de toutes les inscriptions.
  * Statistiques et revenus générés (frais calculés automatiquement).
  * Moteur de recherche et filtres par statut d'inscription.
  * Téléchargement direct des fichiers résumés (DOC/PDF).
  * Bouton d'exportation de la liste au format Excel/CSV.

---

## 📂 Structure des fichiers du projet

```text
├── assets/             # Images, logos et ressources graphiques du site
├── uploads/            # Dossier créé automatiquement pour stocker les fichiers résumés (.pdf, .docx)
├── admin.html          # Interface du tableau de bord d'administration
├── index.html          # Page d'accueil et formulaire d'inscription
├── app.js              # Logique JavaScript interactive du frontend
├── style.css           # Feuilles de styles CSS de l'application
├── server.js           # Serveur backend Express & SQLite
├── package.json        # Fichier de configuration Node.js et dépendances
└── database.db         # Fichier SQLite généré automatiquement contenant les inscriptions
```

---

## ⚙️ Déploiement en production sur le serveur de la faculté

Pour garantir que l'application tourne en permanence en arrière-plan sur le serveur, il est recommandé d'utiliser **PM2** (Process Manager pour Node.js) :

1. Installer PM2 globalement sur le serveur :
   ```bash
   npm install pm2 -g
   ```
2. Démarrer l'application avec PM2 :
   ```bash
   pm2 start server.js --name "gis-2026"
   ```
3. Configurer PM2 pour qu'il se relance automatiquement au démarrage du serveur :
   ```bash
   pm2 startup
   pm2 save
   ```
