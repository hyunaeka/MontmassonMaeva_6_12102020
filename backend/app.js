require('dotenv').config()


const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const CookieSession = require('cookie-session');
const rateLimit = require("express-rate-limit");

const app = express();

// Variable pour l'environnement

const dbUser  = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

console.log(dbUser);
console.log(dbPass);

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');


mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.tgg3v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


  // Middleware pour sécuriser l'application

  app.use(helmet());

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  // Middleware pour gérer Les cookies de session

  app.use(CookieSession({
    name: 's3ssion',
    secret: 's3cure',
    cookie: { secure: true,
              httpOnly: true,
              domain: 'http://localhost:3000',
            }
    })
  );

  // OWASP brut-force 

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limite toutes les requêtes par IP à 100
  });

  app.use(bodyParser.json())

  app.use('/images', express.static(path.join(__dirname, 'images')));

  app.use('/api/auth', userRoutes); 
  app.use('/api/sauces', sauceRoutes);



module.exports = app;