const express = require('express');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de la base de données SQLite
const dbPath = path.join(__dirname, 'database.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    lastName TEXT,
    firstName TEXT,
    country TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    affiliation TEXT,
    position TEXT,
    participationType TEXT,
    fee TEXT,
    dateRegistered TEXT,
    communicationTitle TEXT,
    communicantName TEXT,
    communicantAffiliation TEXT,
    coAuthors TEXT,
    abstractFileName TEXT,
    abstractFileUrl TEXT,
    workshopSelection TEXT
  )
`);

// S'assurer que le dossier des uploads existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration des middlewares
app.use(express.json({ limit: '10mb' })); // Permet de recevoir le fichier en base64
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir les fichiers statiques de l'application
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(uploadsDir));

// Route de soumission du formulaire d'inscription
app.post('/api/register', (req, res) => {
  try {
    const data = req.body;
    const code = data.code;
    
    if (!code) {
      return res.status(400).json({ result: "error", error: "Le code d'inscription est requis." });
    }

    let abstractFileUrl = "";

    // Traitement du fichier joint en Base64
    if (data.abstractFileBase64 && data.abstractFileName) {
      const base64Data = data.abstractFileBase64;
      // Extraire le format mime et les données pures
      // Ex: "data:application/pdf;base64,JVBER..." -> ["data:application/pdf;base64", "JVBER..."]
      const parts = base64Data.split(",");
      if (parts.length === 2) {
        const fileContent = parts[1];
        const buffer = Buffer.from(fileContent, 'base64');
        
        // Assainir le nom de fichier pour éviter les failles de traversée de dossier
        const safeFileName = data.abstractFileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const diskFileName = `${code}_${safeFileName}`;
        const savePath = path.join(uploadsDir, diskFileName);
        
        fs.writeFileSync(savePath, buffer);
        abstractFileUrl = `/uploads/${diskFileName}`;
      }
    }

    // Préparer l'insertion SQL
    const insertStmt = db.prepare(`
      INSERT INTO submissions (
        code, lastName, firstName, country, city, phone, email, affiliation, position,
        participationType, fee, dateRegistered, communicationTitle, communicantName,
        communicantAffiliation, coAuthors, abstractFileName, abstractFileUrl, workshopSelection
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    insertStmt.run(
      code,
      data.lastName || "",
      data.firstName || "",
      data.country || "",
      data.city || "",
      data.phone || "",
      data.email || "",
      data.affiliation || "",
      data.position || "",
      data.participationType || "",
      data.fee || "",
      data.dateRegistered || new Date().toISOString(),
      data.communicationTitle || "",
      data.communicantName || "",
      data.communicantAffiliation || "",
      data.coAuthors || "",
      data.abstractFileName || "",
      abstractFileUrl,
      data.workshopSelection || ""
    );

    console.log(`[Backend] Inscription réussie : ${code}`);
    res.json({ result: "success", code: code, fileUrl: abstractFileUrl });

  } catch (error) {
    console.error("[Backend] Erreur lors de l'enregistrement :", error);
    res.status(500).json({ result: "error", error: error.toString() });
  }
});

// Route pour l'administration : récupère toutes les inscriptions au format attendu par admin.html
app.get('/api/submissions', (req, res) => {
  try {
    const selectStmt = db.prepare('SELECT * FROM submissions ORDER BY id DESC');
    const rows = selectStmt.all();

    // Transformer le résultat au format Google Sheets attendu par admin.html
    const formattedSubmissions = rows.map(row => ({
      "Code Inscription": row.code,
      "Nom": row.lastName,
      "Prénom": row.firstName,
      "Pays": row.country,
      "Ville": row.city,
      "Téléphone": row.phone,
      "Email": row.email,
      "Affiliation": row.affiliation,
      "Fonction": row.position,
      "Type Participation": row.participationType,
      "Nom Communiquant": row.communicantName,
      "Affiliation Communiquant": row.communicantAffiliation,
      "Titre Communication": row.communicationTitle,
      "Co-Auteurs": row.coAuthors,
      "Lien Fichier Résumé": row.abstractFileUrl, // Le lien local (/uploads/...) sera servi par Express
      "Atelier": row.workshopSelection,
      "Montant Calculé": row.fee,
      "Timestamp": row.dateRegistered
    }));

    res.json(formattedSubmissions);
  } catch (error) {
    console.error("[Backend] Erreur lors de la lecture des données :", error);
    res.status(500).json({ result: "error", error: error.toString() });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Serveur démarré avec succès !`);
  console.log(` Portail d'inscription : http://localhost:${PORT}`);
  console.log(` Espace Administration   : http://localhost:${PORT}/admin.html`);
  console.log(`==================================================`);
});
