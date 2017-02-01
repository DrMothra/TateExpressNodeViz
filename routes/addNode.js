/**
 * Created by DrTone on 01/02/2017.
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('addNode');
});

module.exports = router;