/**
 * Created by atg on 16/01/2017.
 */

var parser = require("../model/parser");

function convertToJSON(csvData) {
    var parseOutput = parser.parse(csvData, true , "auto", false, false);

    var dataGrid = parseOutput.dataGrid;
    var headerNames = parseOutput.headerNames;
    var headerTypes = parseOutput.headerTypes;
    var errors = parseOutput.errors;

    var outputText = parser.dataGridRenderer(dataGrid, headerNames, headerTypes, "  ", "\n");

    return outputText;
}

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
    var fileName = req.files.vizFile.name;
    var fileData = req.files.vizFile.data;
    fileData = fileData.toString();

    //DEBUG
    //console.log("File = ", fileName);

    if(fileName.slice(-4) === ".csv") {
        fileData = convertToJSON(fileData);
    } else {
        fileData = JSON.parse(fileData);
    }

    //DEBUG
    console.log("Output = ", fileData);
    res.end();
};
