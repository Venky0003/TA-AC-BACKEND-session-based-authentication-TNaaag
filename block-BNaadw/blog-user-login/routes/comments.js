var express = require('express');
var router = express.Router();
var Comment = require('../models/comment');
var Article = require('../models/article');

router.get('/:id/edit', (req, res, next) => {
  var id = req.params.id;
  Comment.findById(id)
    .then((comment) => {
      res.render('UpdateComment', { comment: comment });
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

router.post('/:id', (req, res, next) => {
  var id = req.params.id;
  Comment.findByIdAndUpdate(id, req.body)
    .then((comments) => {
      res.redirect('/articles/' + comments.articleSlug);
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

// for delting the comments
router.get('/:id/delete', (req, res, next) => {
  var commentId = req.params.id;

  Comment.findByIdAndDelete(commentId)
    .then((comment) => {
      Article.findOneAndUpdate(
        { slug: comment.articleSlug },
        {
          $pull: { comments: comment._id },
        }
      )
        .then((article) => {
          res.redirect('/articles/' + comment.articleSlug);
        })
        .catch((err) => {
          if (err) return next(err);
        });
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

// for likes on the comment
router.get('/:id/likes', (req, res, next) => {
  let commentId = req.params.id;
  Comment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } })
    .populate('article')
    .then((comment) => {
      res.redirect('/articles/' + comment.article.slug);
    });
});

// for dislikes on the comment
router.get('/:id/dislikes', (req, res, next) => {
  let commentId = req.params.id;

  Comment.findByIdAndUpdate(commentId, { $inc: { dislikes: -1 } })
    .then((comment) => {
      res.redirect('/articles/' + comment.articleSlug);
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

module.exports = router;
