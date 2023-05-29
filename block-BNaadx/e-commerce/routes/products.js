let express = require('express');
let router = express.Router();
let Product = require('../models/product');
let User = require('../models/user');
var multer = require('multer');
var path = require('path');
var uploadPath = path.join(__dirname, '../', 'public/uploads');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

var upload = multer({ storage: storage });

// user login
function requireLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

// admin login
function isAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

router.get('/', (req, res, next) => {
  // if botrh user and admin need to see
  if (req.session && (req.session.userId || req.session.adminId)) {
    Product.find()
      .then((products) => {
        // console.log(products)
        res.render('products', { products: products });
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    next(err);
  }
});

//for adding the new product
router.get('/new', isAdmin, (req, res, next) => {
  res.render('addProduct');
});

// for rendering the newly created products
router.post('/', upload.single('image'), isAdmin, (req, res, next) => {
  // console.log(req.file, req.body);
  if (req.file && req.file.filename) {
    req.body.image = req.file && req.file.filename;
  }
  Product.create(req.body)
    .then((result) => {
      console.log(result);
      res.redirect('/products');
    })
    .catch((error) => {
      next(error);
    });
});

// to list the details of the single product
router.get('/:id', (req, res, next) => {
  if (req.session && (req.session.userId || req.session.adminId)) {
    var id = req.params.id;
    Product.findById(id)
      .then((product) => {
        res.render('productDetails', { product });
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    next(err);
  }
});

// to edit the details of product
router.get('/:id/edit', isAdmin, (req, res, next) => {
  var id = req.params.id;
  Product.findById(id)
    .then((product) => {
      res.render('editProduct', { product });
    })
    .catch((error) => {
      console.log(error);
    });
});

// to post the the edited form updated
router.post('/:id', upload.single('image'), isAdmin, (req, res, next) => {
  let id = req.params.id;

  Product.findById(id)
    .then((product) => {
      product.productName = req.body.productName;
      product.quantity = req.body.quantity;
      product.price = req.body.price;
      product.likes = req.body.likes;

      if (req.file) {
        product.image = [req.file.filename];
      }

      product
        .save()
        .then((result) => {
          res.redirect('/products/' + id);
        })
        .catch((error) => {
          if (error) return next(error);
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('An error occurred while finding the product.');
    });
});

// to delete the product
router.get('/:id/delete', isAdmin, (req, res, next) => {
  let id = req.params.id;

  Product.findByIdAndDelete(id)
    .then(() => {
      res.redirect('/products');
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

// for likes on the article
router.get('/:id/likes', isAdmin, (req, res, next) => {
  let id = req.params.id;
  Product.findByIdAndUpdate(id, { $inc: { likes: 1 } }).then(() => {
    res.redirect('/products/' + id);
  });
});

module.exports = router;
