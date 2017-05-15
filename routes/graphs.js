/**
 * Created by atg on 16/01/2017.
 */
"use strict";
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
const GRAPH_SUBTITLE = "T8te";

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
        //Update database
        req.body.graphID = currentGraphID;
        dbase.newGraphID(req.body);
    });
};

exports.createGraph = (req, res, next) => {
    let graphData = {
        "name": req.body.mapName,
        "description": req.body.mapDescription,
        "subtitle": GRAPH_SUBTITLE,
        "status": 0
    };

    graphCommons.new_graph(graphData, result => {
        console.log("New map id created");
        //May just be creating empty map
        if(!req.files) {
            return;
        }
        currentGraphID = result.properties.id;
        let fileName = req.files.vizFile.name;
        let fileData = req.files.vizFile.data;
        fileData = fileData.toString();
        let ext = fileName.slice(-4);

        switch(ext) {
            case ".csv":
                try {
                    fileData = parser.convertToJSON(fileData);
                    fileData = JSON.parse(fileData);
                }
                catch(err) {
                    //DEBUG
                    console.log("File error", err);
                    dataManager.sendFileError();
                }
                break;

            case "json":
                try {
                    fileData = JSON.parse(fileData);
                }
                catch(err) {
                    //DEBUG
                    console.log("File error", err);
                    dataManager.sendFileError();
                }
                break;

            default:
                console.log("Unknown file type!");
                break;
        }

        //DEBUG
        console.log("File name = ", fileName);

        //Have data - create graph
        dataManager.init(graphCommons);
        dataManager.setStatus(dataManager.GRAPH_STATUS.CREATE);
        dataManager.setFileData(fileData);
        dataManager.setGraphID(currentGraphID);
        dataManager.createNodesAndEdges( () => {
            console.log("Graph created");
            //Update database
            req.body.graphID = currentGraphID;
            dbase.createGraph(req.body);
        });
    });

    let msg = req.files ? "Generating map..." : "Map created";
    res.send( {msg: msg} );
};

let currentGraph;
let currentNodeID;
let currentNodeData;
let currentEdgeData;

exports.copyGraph = (req, res, next) => {
    //Get data for this graph
    let mapInfo = req.body;
    currentGraphID = mapInfo.graphID;
    let userName = mapInfo.userName;
    mapInfo.verbose = true;
    graphCommons.graphs(mapInfo.mapID, graph => {
        //New graph with existing data
        copyMap(mapInfo, graph);
    });
    res.send( {msg: "Graph copied"} );
};

function copyMap(mapInfo, graph) {
    //New graph with existing data
    let graphData = {
        "name": mapInfo.name,
        "description": 'Author="' + mapInfo.author + '"',
        "subtitle": GRAPH_SUBTITLE,
        "status": 0
    };
    graphCommons.new_graph(graphData, result => {
        //DEBUG
        console.log("New copied graph created");
        //Create all nodes from original
        let numNodes = graph.nodes.length;
        dataManager.init(graphCommons);
        dataManager.setVerbose(mapInfo.verbose);
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
                dataManager.mapsMerged();
                //Update database
                mapInfo.fromNodeID = result.properties.id;
                dbase.copyGraph(mapInfo);
            })
        });
    });
}

function appendMap(mapID, mapContents) {
    graphCommons.graphs(mapID, map => {
        //Append contents to existing map
        let numNodes = mapContents.nodes.length;
        dataManager.init(graphCommons);
        dataManager.setVerbose(false);
        dataManager.setStatus(dataManager.status.COPY);
        dataManager.setGraphID(mapID);
        dataManager.setCurrentGraph(mapContents);
        dataManager.copyTypes();
        dataManager.setNumberNodesToCreate(numNodes);
        dataManager.copyGraphNodes(mapContents.nodes, 'json', () => {
            console.log("All nodes created");
            dataManager.setNumberEdgesToCreate(mapContents.edges.length);
            dataManager.copyGraphEdges(mapContents.nodes, () => {
                console.log("All edges created");
                dataManager.mapsMerged();
                //Update database
                //mapInfo.fromNodeID = result.properties.id;
                //dbase.copyGraph(mapInfo);
            })
        });
    })
}

function getMaps(srcIDs, callback) {
    let i, numMaps = srcIDs.length, maps = [];
    for(i=0; i<numMaps; ++i) {
        graphCommons.graphs(srcIDs[i], result => {
            maps.push(result);
            if(maps.length === numMaps) {
                callback(maps);
            }
        });
    }
}

exports.getNodeNames = (req, res, next) => {
    //Get list of node names in graph
    currentGraphID = req.body.mapID;
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
    currentGraphID = req.body.mapID;
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
    currentGraphID = req.body.mapID;
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
    currentGraphID = req.body.mapID;

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
                res.render("update", { mapID: currentGraphID, node_Name: req.body.nodeValue, nodes: ["No nodes found"], linkData: []} );
                return;
            }
            let i, nodeNames = [], nodeLinks = [], linkData;
            let edge, numEdges, toNodes = [], currentNode, nodeData;
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

            res.render("updateNode", { mapID: currentGraphID, mapName: graph.properties.name, node_Name: req.body.nodeValue, nodes: nodeNames, linkData: nodeLinks} );
        });
    });
};

exports.findNodes = (req, res, next) => {
    //Search graph for required node
    currentGraphID = req.body.mapID;
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
        let toNode = currentGraph.get_node(currentEdgeData[index].to);
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
        graphCommons.update_graph(currentGraphID, signals, response => {
            console.log("Updated choice ", index);
            res.send( {msg: index} );
            //Update database
            let responseData = response.graph.signals[0];
            req.body.mapID = currentGraphID;
            req.body.fromNodeName = responseData.from;
            req.body.fromNodeID =
            req.body.toNodeName = toNode.name;
            req.body.linkNodeName = currentEdgeData[index].name;
            req.body.weight = choice === 1 ? "Agree (" : "Disagree (";
            req.body.weight += weight + ")";
            dbase.updateNode(req.body);
        })
    });
};

exports.addNewNode = (req, res, next) => {
    currentGraphID = req.body.mapID;

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
    currentGraphID = req.body.mapID;

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
        graphCommons.update_graph(currentGraphID, signals, response => {
            console.log("Added new link");
            res.send( {msg: 'OK'} );
            //Update database
            let numSignals = response.graph.signals.length;
            let signal = numSignals > 1 ? response.graph.signals[1] : response.graph.signals[0];
            req.body.fromNodeID = signal.from;
            req.body.toNodeID = signal.to;
            req.body.linkNodeID = signal.id;
            dbase.addLink(req.body);
        })
    })
};

exports.deleteNode = (req, res, next) => {
    currentGraphID = req.body.mapID;

    let signals = { "signals" : [
        {
            "action": "node_delete",
            "id": req.body.nodeID
        }
    ]};

    graphCommons.graphs(currentGraphID, graph => {
        graphCommons.update_graph(currentGraphID, signals, response => {
            console.log("Deleted node");
            res.send( {msg: 'OK'} );
            req.body.nodeID = response.graph.signals[0].id;
            dbase.deleteNode(req.body);
        })
    })
};

exports.deleteLink = (req, res, next) => {
    currentGraphID = req.body.mapID;

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
                    graphCommons.update_graph(currentGraphID, signals, response => {
                        console.log("Deleted link");
                        res.send( {msg: "Link Deleted"} );
                        let signal = response.graph.signals[0];
                        req.body.fromNodeID = signal.from;
                        req.body.toNodeID = signal.to;
                        req.body.linkNodeID = signal.id;
                        dbase.deleteLink(req.body);
                    });
                } else {
                    res.send( {msg: "No Link Found"} );
                }
            });
        });

    })
};

function validateSearchResults(results) {
    let i, graph, strIndex, description, numResults = results ? results.length : 0;
    let tateGraphs = [], tateGraph;
    for(i=0; i<numResults; ++i) {
        graph = results[i];
        if(!graph) continue;
        if(graph.obj === 'Graph' && graph.owner.username === 'tate') {
            //Check graph subtitle
            if(graph.subtitle !== "" && graph.subtitle.indexOf(GRAPH_SUBTITLE) >= 0) {
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
        'query' : GRAPH_SUBTITLE,
        'limit' : 50
    };

    graphCommons.search(search_query, results => {
        let graphs = validateSearchResults(results);
        res.send( {msg: graphs} );
    });
};

exports.deleteMap = (req, res, next) => {
    //Delete graph
    graphCommons.delete_graph(req.body.mapID, response => {
        res.send( {msg: "Map deleted"});
        //Update database
        dbase.deleteGraph(req.body);
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

exports.mergeMaps = (req, res, next) => {
    //Get destination map ids
    //DEBUG
    //console.log("MapSource =", req.body.mapName1);
    //console.log("MapDest =", req.body.mapNameDest);
    //console.log("MapID =", req.body.mapID1);
    //Get json for each map
    let destMapName = req.body.mapNameDest;
    let destMapID = req.body.mapIDDest;
    let srcIDs = [];
    let i, NUM_MERGE_MAPS = 5, baseMapID = "mapID", currentID;
    for(i=1; i<=NUM_MERGE_MAPS; ++i) {
        currentID = baseMapID + i;
        if(req.body[currentID]) {
            srcIDs.push(req.body[currentID]);
        }
    }

    getMaps(srcIDs, maps => {
        let i, srcMap = maps[0], numMaps = maps.length, currentMap;
        let node, numNodes, link, numLinks, newNode, newLink;
        for(i=1; i<numMaps; ++i) {
            currentMap = maps[i];
            numNodes = currentMap.nodes.length;
            for(node=0; node<numNodes; ++node) {
                newNode = JSON.parse(JSON.stringify(currentMap.nodes[node]));
                srcMap.nodes.splice(-1, 0, newNode);
            }
            numLinks = currentMap.edges.length;
            for(link=0; link<numLinks; ++link) {
                newLink = JSON.parse(JSON.stringify(currentMap.edges[link]));
                srcMap.edges.splice(-1, 0, newLink);
            }
        }
        if(destMapName) {
            //Create new map
            let mapInfo = {};
            mapInfo.name = destMapName;
            mapInfo.author = req.body.author;
            mapInfo.verbose = false;
            copyMap(mapInfo, srcMap);
        } else if(destMapID) {
            appendMap(destMapID, srcMap);
        }
    });

    res.send( {msg: "Merging maps- please wait..."});
};

exports.rollBack = (req, res, next) => {
    //Roll back commands
    //Get current graph
    let currentMapID = req.body.mapID;
    graphCommons.graphs(currentMapID, graph => {
        dbase.getGraphEdits(req.body, edits => {
            let i, numEdits = edits.length;
            for(i=numEdits-1; i>req.body.editID; --i) {
                undoAction(graph, edits[i]);
            }
            //Make copy of updated map
            let mapInfo = {};
            mapInfo.mapID = currentMapID;
            mapInfo.name = req.body.mapName;
            mapInfo.author = req.body.author;
            mapInfo.verbose = false;
            copyMap(mapInfo, graph);
        });
    });

    res.send( {msg: "Creating view"} );
};

exports.getMapEdits = (req, res, next) => {
    //Get all edits done to this graph
    dbase.getGraphEdits(req.body, edits => {
        res.send( {msg: edits} );
    });
};

function undoAction(graph, editInfo) {
    //Get inverse action and execute
    let i, found = false;
    switch(editInfo.type) {
        case "AddNode" :
            //Delete this node
            let numNodes = graph.nodes.length;
            for(i=0; i<numNodes; ++i) {
                if(graph.nodes[i].name === editInfo.fromNodeName) {
                    found=true;
                    break;
                }
            }
            if(found) {
                graph.nodes.splice(i, 1);
            }
            break;

        case "DeleteNode" :
            //Add this node
            if(graph.nodes.length > 0) {
                //Copy first node
                let newNode = JSON.parse(JSON.stringify(graph.nodes[0]));
                newNode.id = editInfo.fromNodeID;
                newNode.name = editInfo.fromNodeName;
                graph.nodes.splice(-1, 0, newNode);
            }
            break;

        case "AddLink" :
            //Remove this link
            //Get id's of to/from nodes
            let numLinks = graph.edges.length;
            let currentLink;
            for(i=0; i<numLinks; ++i) {
                currentLink = graph.edges[i];
                if(currentLink.name === editInfo.linkNodeName) {
                    if(currentLink.from === editInfo.fromNodeID && currentLink.to === editInfo.toNodeID) {
                        found=true;
                        break;
                    }
                }
            }
            if(found) {
                graph.edges.splice(i, 1);
            }
            break;

        case "DeleteLink" :
            //Add this link
            if(graph.edges.length > 0) {
                //Copy first link
                let newLink = JSON.parse(JSON.stringify(graph.edges[0]));
                newLink.from = editInfo.fromNodeID;
                newLink.to = editInfo.toNodeID;
                newLink.id = editInfo.linkNodeID;
                newLink.name = editInfo.linkNodeName;
                graph.edges.splice(-1, 0, newLink);
            }
            break;

        default:
            break;
    }
}