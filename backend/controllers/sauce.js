  
const Sauce = require('../models/sauce');
const fs = require('fs');

// Mise en place de la commande créer une sauce

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
      ...sauceObject,  
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    })
    sauce.save()
    .then(() => {res.status(201).json({message: 'Sauce créée avec succès'})})
    .catch((error) => {res.status(400).json({error: error})});
};

// Récupérer les données d'une sauce

exports.getSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).send(new Error('Sauce introuvable!'));
      }
      res.status(200).json(sauce);
    })
    .catch((error) => {res.status(404).json({error: error})})
    ;
};

// Récupération de toutes les sauces pour affichage 

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch(() => {
      res.status(500).send(new Error('Erreur base de données!'));
    });
};

// Mise en place de la commande modifier une sauce 

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
  {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  Sauce.updateOne({_id: req.params.id}, { ...sauceObject, _id: req.params.id })
  .then(() => {
      res.status(201).json({
        message: 'Sauce modifiée avec succès'
      });
    }
  ).catch((error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// Mise en place de la commande supprimer une sauce


exports.deleteSauce = (req, res, next) => {
  
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1]; 
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};


// Mise en place du système de like pour les sauces. 

exports.likeSauce = (req, res, next) => {


  // Variable pour récupérer l'Id de la sauce, l'Id de l'user unique et les like

  const IdUser = req.body.userId;
  const IdSauce = req.params.id;
  const like = req.body.like;

//************************************************************ Logique pour le système de like et dislike **********************************************************//

// si Like === 1 l'utilisateur aime la sauce (Like)

 if(like === 1) {
      Sauce.updateOne({ _id: IdSauce }, {
        $inc: { likes: 1 },
        $push: { usersLiked: IdUser },
      })
        .then(() => { res.status(201).json({ message: 'Votre avis a été pris en compte' }); })
        .catch((error) => { res.status(400).json({ error: error }); });

// si like === -1 l'utilisateur n'aime pas la sauce (Dislike)

    } else if(like === -1) {
      Sauce.updateOne({ _id: IdSauce }, {
        $inc: { dislikes: 1 },
        $push: { usersDisliked: IdUser },
      })
        .then(() => { res.status(201).json({ message: 'Votre avis a bien été pris en compte' }); })
        .catch((error) => { res.status(400).json({ error: error }); });

// si Like === 0 l'utilisateur annule

    } else if(like === 0) {
    Sauce.findOne({ _id: IdSauce})
      .then((sauce) => {

// Si l'Id de Useur est répértorié dans le tableau des utilisateurs ayant Like on annule son Like et on le retire du tabeau

        if(sauce.usersLiked.find(user => user === IdUser)) {
          Sauce.updateOne({ _id: IdSauce }, {
            $inc: { likes: -1 },
            $pull: { usersLiked: IdUser },
          })
          .then(() => { res.status(201).json({ message: 'Votre appréciation a bien été retirée' }); })
          .catch((error) => { res.status(400).json({ error: error }); });
          
// Si l'Id de Useur est répértorié dans le tableau des utilisateurs ayant Dislike on annule son Dislike et on le retire du tabeau

        } else if (sauce.usersDisliked.find(user => user === IdUser)) {
          Sauce.updateOne({ _id: IdSauce }, {
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: IdUser },
          })
            .then(() => { res.status(201).json({ message: 'Votre appréciation a bien été retirée' }); })
            .catch((error) => { res.status(400).json({ error: error }); });
        }
      })
      .catch((error) => { res.status(404).json({ error: error }); });



  }
  };