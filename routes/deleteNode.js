/**
 * Created by DrTone on 23/02/2017.
 */


var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('deleteNode', { graphID: null, node_Name: null, node: null, nodeData: []} );
});

module.exports = router;