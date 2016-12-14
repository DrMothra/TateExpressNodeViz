var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { graphID: "Not defined"});
});

module.exports = router;
