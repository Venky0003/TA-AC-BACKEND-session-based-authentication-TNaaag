var express = require('express');
var router = express.Router();
var slugify = require('slugify');
var { requireLogin } = require('../middlewares/requireLogin');
let Article = require('../models/article');
let Comment = require('../models/comment');

// to find the articles listing all in article.ejs
router.get('/', requireLogin, (req, res, next) => {
  Article.find({})
    .then((articles) => {
      // console.log(articles);
      res.render('articles', { articles: articles });
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

// for adding new articles
router.get('/new', requireLogin, (req, res) => {
  res.render('addArticle');
});

// posting article in the articles.ejs page
router.post('/', requireLogin, (req, res, next) => {
  var { title, description, likes, author, comments } = req.body;
  var slug = slugify(title, { lower: true });
  var newArticle = { title, description, likes, author, comments, slug };

  Article.create(newArticle)
    .then((result) => {
      res.redirect('/articles');
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

router.get('/:slug', requireLogin, (req, res, next) => {
  var slug = req.params.slug;

  Article.findOne({ slug: slug })
    .populate('comments')
    .then((article) => {
      // console.log(article);
      res.render('articleDetails', { article: article });
    })
    .catch((error) => console.log(error));
});

// to edit we need to find the artcile
router.get('/:slug/edit', requireLogin, (req, res, next) => {
  const slug = req.params.slug;

  Article.findOne({ slug: slug })
    .then((article) => {
      res.render('editArticleForm', { article: article });
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

// to update the edited article
router.post('/:slug', requireLogin, (req, res, next) => {
  // let id = req.params.id;
  const slug = req.params.slug;

  Article.findOneAndUpdate({ slug }, req.body)
    .then((article) => {
      res.redirect('/articles/' + slug);
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

// to delete the article
router.get('/:slug/delete', requireLogin, (req, res, next) => {
  // let id = req.params.id;
  const slug = req.params.slug;

  Article.findOneAndDelete({ slug })
    .then((article) => {
      return Comment.deleteMany({ articleId: article.slug })
        .then((article) => {
          res.redirect('/articles');
        })
        .catch((error) => {
          if (error) return next(error);
        });
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

// for likes on the article
router.get('/:slug/likes', requireLogin, (req, res, next) => {
  var slug = req.params.slug;

  Article.findOneAndUpdate({ slug }, { $inc: { likes: 1 } })
    .then((article) => {
      res.redirect('/articles/' + slug);
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

// add comments
router.post('/:slug/comments', requireLogin, (req, res, next) => {
  var slug = req.params.slug;
  req.body.articleSlug = slug;

  // Find the associated article by slug
  Article.findOne({ slug })
    .then((article) => {
      if (!article) {
        req.flash('error', 'Article not found');
        return res.redirect('/articles');
      } else {
        req.body.article = article._id;

        Comment.create(req.body)
          .then((comment) => {
            // Update the article with the comment ID
            Article.findByIdAndUpdate(
              article._id,
              { $push: { comments: comment._id } },
              { new: true }
            )
              .then((updatedArticle) => {
                res.redirect('/articles/' + slug);
              })
              .catch((error) => {
                if (error) return next(error);
              });
          })
          .catch((error) => {
            if (error) return next(error);
          });
      }
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

module.exports = router;
