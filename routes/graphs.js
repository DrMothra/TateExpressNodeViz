/**
 * Created by atg on 16/01/2017.
 */

let parser = require("../model/parser");

let manager = exports.manager = require("../model/dataManager");

let dataManager = new manager.dataManager();

let gc = require("graphcommons");
let accesskey = process.env.GRAPH_COMMONS_API_KEY;
let graphCommons = new gc(accesskey, result => {
    console.log("Created graph commons = ", result);
});

//Database
let dbase = require('../model/databaseManager');
let currentGraphID;

//Routes for all graph-related pages
exports.generateNewGraphID = (req, res, next) => {
    let graphData = {
        "name": req.body.name,
        "description": req.body.description,
        "subtitle": req.body.subtitle,
        "status": 0
    };
    //console.log("graphcommons = ", graph);
    graphCommons.new_graph(graphData, result => {
        //currentGraph.setCurrentGraphID(result.properties.id);
        //DEBUG
        console.log("Graph id = ", result.properties.id);
        currentGraphID = result.properties.id;
        res.send( {msg: currentGraphID} );
    });
};

exports.createGraph = (req, res, next) => {

    let fileName = req.files.vizFile.name;
    let fileData = req.files.vizFile.data;
    fileData = fileData.toString();
    let ext = fileName.slice(-4);

    switch(ext) {
        case ".csv":
            fileData = parser.convertToJSON(fileData);
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
    console.log("File name = ", fileName);

    //Have data - create graph
    dataManager.init(graphCommons);
    dataManager.setStatus(dataManager.status.CREATE);
    dataManager.setFileData(fileData);
    dataManager.setGraphID(currentGraphID);
    dataManager.createNodesAndEdges( () => {
        console.log("Graph created");
    });

    res.send( {msg: "Generating graph..."} );
};

let currentGraph;
let currentNodeID;
let currentNodeData;
let currentEdgeData;

exports.copyGraph = (req, res, next) => {
    //Get data for this graph
    currentGraphID = req.body.graphID;
    let userName = req.body.userName;

    graphCommons.graphs(currentGraphID, graph => {
        //New graph with existing data
        let graphData = {
            "name": req.body.name,
            "description": 'Author="'+userName+'"',
            "subtitle": "TateCartographyProject",
            "status": 0
        };
        graphCommons.new_graph(graphData, result => {
            //DEBUG
            console.log("New copied graph created");
            res.send( {msg: "Graph copied"} );
            //Create all nodes from original
            let numNodes = graph.nodes.length;
            dataManager.init(graphCommons);
            dataManager.setStatus(dataManager.status.COPY);
            dataManager.setGraphID(result.properties.id);
            dataManager.setCurrentGraph(graph);
            dataManager.copyTypes();
            dataManager.setNumberNodesToCreate(numNodes);
            dataManager.copyGraphNodes(graph.nodes, 'json', () => {
                console.log("All nodes created");
                dataManager.setNumberEdgesToCreate(graph.edges.length);
                dataManager.copyGraphEdges(graph.nodes, () => {
                    console.log("All edges created");
                })
            });
        });
    });
};

exports.getNodeNames = (req, res, next) => {
    //Get list of node names in graph
    currentGraphID = req.body.graphID;
    graphCommons.graphs(currentGraphID, graph => {
        let i, nodeNames = [], numNodes = graph.nodes.length;
        for(i=0; i<numNodes; ++i) {
            nodeNames.push(graph.nodes[i].name);
        }

        res.send( {msg: nodeNames} );
    });
};

exports.getLinkTypes = (req, res, next) => {
    //Get list of edge types in graph
    currentGraphID = req.body.graphID;
    graphCommons.graphs(currentGraphID, function(graph) {
        let i, typeNames = [], numTypes = graph.properties.edgeTypes.length;
        for(i=0; i<numTypes; ++i) {
            typeNames.push(graph.properties.edgeTypes[i].name);
        }

        res.send( {msg: typeNames} );
    });
};

exports.getNodeTypes =  (req, res, next) => {
    //Get list of node types in graph
    currentGraphID = req.body.graphID;
    graphCommons.graphs(currentGraphID, function(graph) {
        let i, typeNames = [], numTypes = graph.properties.nodeTypes.length;
        for(i=0; i<numTypes; ++i) {
            typeNames.push(graph.properties.nodeTypes[i].name);
        }

        res.send( {msg: typeNames} );
    });
};

exports.searchGraph = (req, res, next) => {
    //Search graph for required node
    currentGraphID = req.body.graphID;

    graphCommons.graphs(currentGraphID, graph => {
        currentGraph = graph;
        //Search for node
        let search_query = {
            "query": req.body.nodeValue,
            "graph": currentGraphID
        };
        graphCommons.nodes_search(search_query, results => {
            //console.log(results);
            let numNodes = results.nodes.length;
            if(numNodes === 0) {
                res.render("update", { graphID: currentGraphID, node_Name: req.body.nodeValue, nodes: ["No nodes found"], linkData: []} );
                return;
            }
            let i, nodeNames = [], nodeLinks = [], linkData;
            let edge, numEdges, toNodes = [], currentNode;
            for(i=0; i<numNodes; ++i) {
                currentNode = results.nodes[i];
                currentNodeID = currentNode.id;
                currentNodeData = currentGraph.get_node(currentNodeID);
                currentEdgeData = currentGraph.edges_from(currentNodeData);

                numEdges = currentEdgeData.length;
                if(numEdges === 0) {
                    nodeNames.push(currentNode.name + " has no links");
                    nodeLinks.push([]);
                } else {
                    nodeNames.push(currentNode.name);
                    for(edge=0; edge<numEdges; ++edge) {
                        nodeData = currentGraph.get_node(currentEdgeData[edge].to);
                        linkData = {};
                        linkData.linkType = currentEdgeData[edge].name;
                        linkData.linkTo = nodeData.name;
                        toNodes.push(linkData);
                    }
                    nodeLinks.push(toNodes);
                }
            }

            res.render("updateNode", { graphID: currentGraphID, graphName: graph.properties.name, node_Name: req.body.nodeValue, nodes: nodeNames, linkData: nodeLinks} );
        });
    });
};

exports.findNodes = (req, res, next) => {
    //Search graph for required node
    currentGraphID = req.body.graphID;
    let nodeName = req.body.nodeValue;

    graphCommons.graphs(currentGraphID, graph => {
        currentGraph = graph;
        //Search for node
        let search_query = {
            "query": nodeName,
            "graph": currentGraphID
        };
        graphCommons.nodes_search(search_query, results => {
            //console.log(results);
            let numNodes = results.nodes.length;
            let i, currentNode, nodeData = [], nodeInfo;
            for(i=0; i<numNodes; ++i) {
                currentNode = results.nodes[i];
                nodeInfo = {};
                nodeInfo.name = currentNode.name;
                nodeInfo.id = currentNode.id;
                nodeInfo.type = currentNode.nodetype.name;
                nodeData.push(nodeInfo);
            }

            res.send( {msg: nodeData} );
        });
    });
};

exports.processLinks = (req, res, next) => {
    //Get updated graph
    graphCommons.graphs(currentGraphID, function(graph) {
        currentGraph = graph;
        //Get index into edge data
        let index = req.body.link;
        let choice = parseInt(req.body.choice, 10);
        console.log("Choice = ", choice);

        currentNodeData = currentGraph.get_node(currentNodeID);
        currentEdgeData = currentGraph.edges_for(currentNodeData, "from");

        //DEBUG
        console.log("Edge data = ", currentEdgeData[index]);
        let weight = parseInt(currentEdgeData[index].weight, 10);
        console.log("Weight = ", weight);

        let signals = { "signals" : [
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
            return;
        }
        if(weight > 10) {
            res.send( {msg: 'OK'} );
            return;
        }
        graphCommons.update_graph(currentGraphID, signals, () => {
            console.log("Updated choice ", index);
            res.send( {msg: index} );
        })
    });
};

exports.addNewNode = (req, res, next) => {
    currentGraphID = req.body.graphID;

    let signals = { "signals" : [
        {
            "action": "node_create",
            "type": req.body.addNodeType,
            "name": req.body.addNodeName
        }
    ]};

    graphCommons.graphs(currentGraphID, graph => {
        graphCommons.update_graph(currentGraphID, signals, response => {
            console.log("Added new node");
            let temp = graph;
            res.send( {msg: 'OK'});
            //Update database
            req.body.nodeID = response.graph.signals[0].id;
            dbase.addNode(req.body);
        })
    });
};

exports.addNewLink = (req, res, next) => {
    currentGraphID = req.body.graphID;

    let signals = { "signals" : [
        {
            "action": "edge_create",
            "from_name": req.body.fromName,
            "from_type": req.body.fromType,
            "name": req.body.linkType,
            "to_name": req.body.toName,
            "to_type": req.body.toType
        }
    ]};

    graphCommons.graphs(currentGraphID, graph => {
        graphCommons.update_graph(currentGraphID, signals, function() {
            console.log("Added new link");
            res.send( {msg: 'OK'} );
        })
    })
};

exports.deleteNode = (req, res, next) => {
    currentGraphID = req.body.graphID;

    let signals = { "signals" : [
        {
            "action": "node_delete",
            "id": req.body.nodeID
        }
    ]};

    graphCommons.graphs(currentGraphID, graph => {
        graphCommons.update_graph(currentGraphID, signals, function() {
            console.log("Deleted node");
            res.send( {msg: 'OK'} );
        })
    })
};

exports.deleteLink = (req, res, next) => {
    currentGraphID = req.body.graphID;

    let i, fromID, toID, nodeData, edgeData, edgeID, linkName = req.body.linkName;
    graphCommons.graphs(currentGraphID, graph => {
        let search_query = {
            "query": req.body.node_FromName,
            "graph": currentGraphID
        };
        graphCommons.nodes_search(search_query, results => {
            fromID = results.nodes[0].id;
            search_query = {
                "query": req.body.node_ToName,
                "graph": currentGraphID
            };
            graphCommons.nodes_search(search_query, results => {
                toID = results.nodes[0].id;
                nodeData = graph.get_node(fromID);
                edgeData = graph.edges_from(nodeData);
                for(i=0; i<edgeData.length; ++i) {
                    if(edgeData[i].name === linkName) {
                        edgeID = edgeData[i].id;
                        break;
                    }
                }
                if(edgeID !== undefined) {
                    let signals = { "signals" : [
                        {
                            "action": "edge_delete",
                            "id": edgeID,
                            "from": fromID,
                            "to": toID,
                            "name": linkName
                        }
                    ]};
                    graphCommons.update_graph(currentGraphID, signals, () => {
                        console.log("Deleted link");
                        res.send( {msg: 'OK'} );
                    });
                }
            });
        });

    })
};

function validateSearchResults(results) {
    let i, graph, strIndex, description, numResults = results.length;
    let tateGraphs = [], tateGraph;
    for(i=0; i<numResults; ++i) {
        graph = results[i];
        if(!graph) continue;
        if(graph.obj === 'Graph' && graph.owner.username === 'tate') {
            //Check graph subtitle
            if(graph.subtitle !== "" && graph.subtitle.indexOf('TateCartographyProject') >= 0) {
                tateGraph = {};
                tateGraph.graphID = graph.id;
                tateGraph.name = graph.name;
                description = graph.description;
                strIndex = description.indexOf("Author=");
                if(strIndex >= 0) {
                    //Take Author=" off
                    description = description.slice(strIndex+8);
                    strIndex = description.indexOf('"');
                    if(strIndex >= 0) {
                        description = description.substr(0, strIndex);
                        tateGraph.author = description;
                    }
                } else {
                    tateGraph.author = "None";
                }

                tateGraphs.push(tateGraph);
            }
        }
    }

    return tateGraphs;
}

exports.searchCommons = (req, res, next) => {
    let search_query = {
        'query' : req.body.query
    };
    let searchresults = function(results) {
        let graphs = validateSearchResults(results);
        res.send( {msg: graphs} );
    };

    graphCommons.search(search_query, searchresults);
};

exports.deleteGraph = (req, res, next) => {
    //Delete graph
    graphCommons.delete_graph(req.body.graphID, response => {
        res.send( {msg: "Graph deleted"});
    });
};

exports.modifyGraph = (req, res, next) => {
    //Get graph name
    currentGraphID = req.body.graphID;
    let graphName = req.body.name;
    if(graphName === undefined) {

    }
    graphCommons.graphs(currentGraphID, graph => {
        graphName = graph.properties.name;
        res.render('modify', { graphID: currentGraphID, graphName: graphName} );
    });
};
