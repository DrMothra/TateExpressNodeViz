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
var manager = exports.manager = require("../model/dataManager");

var dataManager = new manager.dataManager();

var gc = require("graphcommons");
var accesskey = process.env.GRAPH_COMMONS_API_KEY;
var graphCommons = new gc(accesskey, function(result) {
    console.log("Created graph commons = ", result);
});

var currentGraphID;
//DEBUG
var processed = false;

//Routes for all graph-related pages
exports.generateNewGraph = function(req, res, next) {
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
        currentGraphID = result.properties.id;
        res.send( {msg: currentGraphID} );
    });
};

var processing = false;

exports.generateGraph = function(req, res, next) {

    var fileName = req.files.vizFile.name;
    var fileData = req.files.vizFile.data;
    fileData = fileData.toString();
    var ext = fileName.slice(-4);

    switch(ext) {
        case ".csv":
            fileData = convertToJSON(fileData);
            fileData = JSON.parse(fileData);
            break;

        case "json":
            fileData = JSON.parse(fileData);
            break;

        default:
            console.log("Unknown file type!");
            break;
    }

    //DEBUG
    //console.log("File data = ", fileData);

    //Have data - create graph
    dataManager.init(graphCommons);
    dataManager.setFileData(fileData);
    dataManager.setGraphID(currentGraphID);
    dataManager.createNodesAndEdges(function() {
        console.log("Graph created");
    });

    res.send( {msg: "Generating graph..."} );
};

var currentGraph;
var currentNodeID;
var currentNodeData;
var currentEdgeData;

exports.searchGraph = function(req, res, next) {
    //Search graph for required node
    currentGraphID = req.body.graph_id;
    graphCommons.graphs(currentGraphID, function(graph) {
        currentGraph = graph;
        //Search for node
        var search_query = {
            "query": req.body.nodeValue,
            "graph": currentGraphID
        };
        graphCommons.nodes_search(search_query, function(results) {
            //console.log(results);
            currentNodeID = results.nodes[0].id;
            currentNodeData = currentGraph.get_node(currentNodeID);
            currentEdgeData = currentGraph.edges_for(currentNodeData, "from");
            //DEBUG
            //console.log("Edge data = ", currentEdgeData);

            //res.render("index", { graphID: req.body.graph_id});
            //Get name of to nodes
            var toNodes = [], linkData, nodeData;
            var i, numNodes=currentEdgeData.length;
            for(i=0; i<numNodes; ++i) {
                nodeData = currentGraph.get_node(currentEdgeData[i].to);
                linkData = {};
                linkData.linkType = currentEdgeData[i].name;
                linkData.linkTo = nodeData.name;
                toNodes.push(linkData);
            }

            res.render("links", { node: req.body.nodeValue, linkData: toNodes} );
        });
    });
};

exports.processLinks = function(req, res, next) {
    //Get updated graph
    graphCommons.graphs(currentGraphID, function(graph) {
        currentGraph = graph;
        //Get index into edge data
        var index = req.body.link;
        var choice = parseInt(req.body.choice, 10);
        console.log("Choice = ", choice);

        currentNodeData = currentGraph.get_node(currentNodeID);
        currentEdgeData = currentGraph.edges_for(currentNodeData, "from");

        //DEBUG
        console.log("Edge data = ", currentEdgeData[index]);
        var weight = parseInt(currentEdgeData[index].weight, 10);
        console.log("Weight = ", weight);

        var signals = { "signals" : [
            {
                "action": "edge_update",
                "id": currentEdgeData[index].id,
                "from": currentEdgeData[0].from,
                "to": currentEdgeData[index].to,
                "weight": choice === 1 ? ++weight : --weight
            }
        ]};

        //Weight within limits
        weight = signals.signals[0].weight;
        console.log("New weight = ", weight);
        if(weight <=0) {
            res.send( {msg: 'OK'} );
        }
        if(weight > 10) {
            res.send( {msg: 'OK'} );
        }
        graphCommons.update_graph(currentGraphID, signals, function() {
            console.log("Updated choice");
            res.send( {msg: 'OK'} );
        })
    });
};


