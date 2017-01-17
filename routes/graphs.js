/**
 * Created by atg on 16/01/2017.
 */

//var currentGraph = require("../model/currentGraph.js");
var gc = require("graphcommons");
var accesskey = process.env.GRAPH_COMMONS_API_KEY;
var graphCommons = new gc(accesskey, function(result) {
    console.log("Created graph commons = ", result);
});

//Routes for all graph-related pages
exports.generateGraph = function(req, res, next) {
    var graphData = {
        "name": "My test graph",
        "description": "Tester",
        "status": 0
    };
    //console.log("graphcommons = ", graph);
    graphCommons.new_graph(graphData, function(result) {
        //currentGraph.setCurrentGraphID(result.properties.id);
        //DEBUG
        console.log("Graph id = ", result.properties.id);
        res.send( {msg: result.properties.id} );
    });
};

exports.processUpload = function(req, res, next) {
    console.log("File uploaded = ", req.files);
    var temp = req.files.vizFile.data.toString();
    var vizDataFile = JSON.parse(temp);
    console.log("New json file created");

    res.end();
};
