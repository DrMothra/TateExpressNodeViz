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
var currentGraphID;

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
    var manager = new dataManager(currentGraphID, fileData, res);
    manager.init();
    manager.preSort();
    manager.sortLinks();
    manager.sortArtists();
    manager.createNodes();

    //Return but wait for task completion
    //res.write("Processing");
    //res.end();
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

var dataManager = function(graphID, vizData, res) {
    //Data
    this.data = vizData;
    this.numItems = this.data.length;
    this.response = res;
    //DEBUG
    console.log("Num items = ", this.numItems);
    this.accessKey = accesskey;
    this.graph_id = graphID;
    this.nodesToCreate = 0;
    this.nodesCreated = 0;
    this.edgesToCreate = 0;
    this.edgesCreated = 0;
    this.graphComplete = false;

    //Init
    this.init = function() {
        //this.graphcommons = new gc(this.accessKey);
    };

    //Links
    var linkTypes = ["Made by", "Inspired by", "In opposition to", "In response to", "Associated / works with", "Exhibited with", "Exhibited at"];
    var numLinkTypes = linkTypes.length;
    var links = {
        "Made by" : [],
        "Inspired by" : [],
        "In opposition to" : [],
        "In response to" : [],
        "Associated / works with" : [],
        "Exhibited with" : [],
        "Exhibited at" : []
    };

    //Types - just artists for now
    var artists = [];

    var signalNode = {
        "signals": [
            {
                "action": "node_create",
                "type": "NodeType",
                "name": "NodeName",
                "description": "test description"
            }
        ]
    };

    var signalEdge = {
        "signals": [
            {
                "action": "edge_create",
                "from_type": "type",
                "from_name": "name",
                "to_type": "type",
                "to_name": "name",
                "name": "edgeName"
            }
        ]
    };

    this.preSort = function() {
        //Remove whitespace from fields
        var i, dataItem, key, attribute;
        for(i=0; i<this.numItems; ++i) {
            dataItem = this.data[i];
            for(key in dataItem) {
                attribute = dataItem[key];
                if(typeof attribute === 'string' && attribute !== "" && attribute !== null) {
                    dataItem[key] = attribute.trim();
                }
            }
            if(dataItem["Type of node"]) {
                ++this.nodesToCreate;
            }
            //DEBUG
            //if(dataItem["Exhibited at"]) {
            //    console.log(dataItem["Exhibited at"]);
            //}
        }
        //DEBUG
        console.log("Need to create ", this.nodesToCreate, " nodes");
    };

    this.sortLinks = function() {
        var i, j, dataItem;
        for(i=0; i<this.numItems; ++i) {
            dataItem = this.data[i];
            for(j=0; j<numLinkTypes; ++j) {
                if(dataItem[linkTypes[j]]) {
                    links[linkTypes[j]].push(dataItem[linkTypes[j]]);
                }
            }
        }
    };

    this.sortArtists = function() {
        var i, dataItem;
        for(i=0; i<this.numItems; ++i) {
            dataItem = this.data[i];
            if(dataItem["Type of node"] === "Artists") {
                artists.push(dataItem["Node short name"]);
            }
        }
    };

    this.displayLinks = function(linkname) {
        console.log("Links = ", links[linkname]);
    };

    this.createNodes = function() {
        var i, dataItem;
        //DEBUG
        console.log("Create nodes");
        for(i=0; i<this.numItems; ++i) {
            dataItem = this.data[i];
            if(dataItem["Type of node"]) {
                this.createGraphNode(dataItem["Type of node"], dataItem["Node short name"], dataItem["Description"]);
            }
        }
    };

    this.createGraphNode = function(type, name, description) {
        //Create node
        signalNode.signals[0].type = type;
        signalNode.signals[0].name = name;
        signalNode.signals[0].description = description;
        var _this = this;
        graphCommons.update_graph(this.graph_id, signalNode, function() {
            console.log("Node ", name, " created");
            if(--_this.nodesToCreate === 0) {
                _this.createEdges();
            }
        });
    };

    this.createEdges = function() {
        var i, j, k, dataItem, linkInfo, numLinks, edges=0;
        for (i = 0; i < this.numItems; ++i) {
            dataItem = this.data[i];
            for(j=0; j<numLinkTypes; ++j) {
                linkInfo = this.getLinkInfo(dataItem, linkTypes[j]);
                if(linkInfo !== null) {
                    for(k=0, numLinks=linkInfo.length; k<numLinks; ++k) {
                        ++edges;
                        this.createGraphEdge(dataItem["Type of node"], dataItem["Node short name"], linkInfo[k].type, linkInfo[k].name, linkTypes[j]);
                    }
                }
            }
        }
        this.edgesToCreate = edges;
        //DEBUG
        console.log("Need to create ", this.edgesToCreate, " edges");
    };

    this.createGraphEdge = function(fromType, fromName, toType, toName, edgeName) {
        //Create edge
        var _this = this;
        signalEdge.signals[0].from_type = fromType;
        signalEdge.signals[0].from_name = fromName;
        signalEdge.signals[0].to_type = toType;
        signalEdge.signals[0].to_name = toName;
        signalEdge.signals[0].name = edgeName;
        graphCommons.update_graph(this.graph_id, signalEdge, function() {
            console.log("Edge ", _this.edgesCreated, edgeName, " created");
            ++_this.edgesCreated;
            if(_this.edgesCreated === _this.edgesToCreate) {
                console.log("All edges created");
                _this.graphComplete = true;
                _this.response.send( {msg: "OK"});
            }
        })
    };

    this.getLinkInfo = function(data, linkType) {
        if(!data[linkType]) return null;

        var name = data[linkType];
        var entries = [];
        entries.push(name);
        //Check for multiple names
        var i, type;
        var link, linkInfo=[];
        if(name.indexOf(',') >=0) {
            entries = name.split(",");
            for(i=0; i<entries.length; ++i) {
                entries[i] = entries[i].trim();
            }
        }

        var numEntries = entries.length;
        for(i=0; i<numEntries; ++i) {
            type = this.getType(entries[i]);
            if(!type) return null;
            link = {
                "name": entries[i],
                "type": type
            };
            linkInfo.push(link);
        }

        return linkInfo;
    };

    this.getType = function(name) {
        //Search type arrays for this name
        //Only check artist arrays for now
        var i, numArtists=artists.length;
        for(i=0; i<numArtists; ++i) {
            if(name === artists[i]) {
                return "Artists";
            }
        }

        //Not an artist - search everything else
        var dataItem;
        for(i=0; i<this.numItems; ++i) {
            dataItem = this.data[i];
            if(name === dataItem["Node short name"]) {
                return dataItem["Type of node"];
            }
        }

        return null;
    };

    this.graphCompleted = function() {
        return this.graphComplete;
    }
};
