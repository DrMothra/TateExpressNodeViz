/**
 * Created by DrTone on 31/01/2017.
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('update', { graphID: null, node_Name: null, node: null, linkData: []});
});

module.exports = router;