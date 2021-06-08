const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');



// Mise en place de la fonction " S'enregistrer "

exports.signup = (req, res, next) => {

        bcrypt.hash(req.body.password, 10) // Utilisation de bcrypt pour le cryptage du mot de passe + salage 10
        .then(hash => {   
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
            .then(() => res.status(201).json({message: 'Vous avez bien été enregistré'}))
            .catch(error => res.status(400).json({error}))
        })
        .catch(error => res.status(500).json({error}))
    };


// Mise en place de la fonction "Se connecter"

    exports.login = (req, res, next) => {
      User.findOne({ email: req.body.email }) // On recherche l'adresse email de l'utilisateur pour vérifier la connexion 
        .then(user => {
          if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
          }
          bcrypt.compare(req.body.password, user.password) // Vérification du mot de passe crypté par BCRYPT 
            .then(valid => {
              if (!valid) {
                return res.status(401).json({ error: 'Mot de passe incorrect !' });
              }
              res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                  { userId: user._id },
                  'RANDOM_TOKEN_SECRET',  // Création d'un Token d'authentification qui sera valable 24h
                  { expiresIn: '24h' }
                )
              });


            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    };