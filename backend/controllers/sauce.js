  
const Sauce = require('../models/sauce');
const fs = require('fs');

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

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch(() => {
      res.status(500).send(new Error('Erreur base de données!'));
    });
};


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

exports.likeSauce = (req, res, next) => {
    if(req.body.like === 0) {
      Sauce.findOne({ _id: req.params.id})
        .then((sauce) => {
          if(sauce.usersLiked.find(user => user === req.body.userId)) {
            Sauce.updateOne({ _id: req.params.id }, {
              $inc: { likes: -1 },
              $pull: { usersLiked: req.body.userId },
            })
            .then(() => { res.status(201).json({ message: 'Votre appréciation a bien été retirée' }); })
            .catch((error) => { res.status(400).json({ error: error }); });
            
          } else if (sauce.usersDisliked.find(user => user === req.body.userId)) {
            Sauce.updateOne({ _id: req.params.id }, {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
            })
              .then(() => { res.status(201).json({ message: 'Votre appréciation a bien été retirée' }); })
              .catch((error) => { res.status(400).json({ error: error }); });
          }
        })
        .catch((error) => { res.status(404).json({ error: error }); });

    } else if(req.body.like === 1) {
      Sauce.updateOne({ _id: req.params.id }, {
        $inc: { likes: 1 },
        $push: { usersLiked: req.body.userId },
      })
        .then(() => { res.status(201).json({ message: 'Votre avis a été pris en compte' }); })
        .catch((error) => { res.status(400).json({ error: error }); });

    } else if(req.body.like === -1) {
      Sauce.updateOne({ _id: req.params.id }, {
        $inc: { dislikes: 1 },
        $push: { usersDisliked: req.body.userId },
      })
        .then(() => { res.status(201).json({ message: 'Votre avis a bien été pris en compte' }); })
        .catch((error) => { res.status(400).json({ error: error }); });
    }
  };