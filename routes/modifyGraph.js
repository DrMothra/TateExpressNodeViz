/**
 * Created by DrTone on 09/02/2017.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render("modify", {graphID: req.graphID, graphName: req.name});
});

module.exports = router;
