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
                    nodeNames.push("There are no links from " + currentNode.name);
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
        if(!currentNodeData) {
            console.log("No node data!");
            res.send( {msg: "Error ", index} );
            return;
        }
        currentEdgeData = currentGraph.edges_for(currentNodeData, "from");
        if(!currentEdgeData) {
            console.log("No edge data!");
            res.send( {msg: "Error ", index} );
            return;
        }

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
            res.send( {msg: 'Minimum weighting reached', index: index} );
            return;
        }
        if(weight > 10) {
            res.send( {msg: 'Maximum weighting reached', index: index} );
            return;
        }
        graphCommons.update_graph(currentGraphID, signals, response => {
            console.log("Updated choice ", index);
            res.send( {msg: "Updated", index: index} );
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

exports.addNewNodes = (req, res, next) => {
    currentGraphID = req.body.mapID;
    let nodeNames = [];
    let nodeTypes = [];
    let node, baseNode = "addNodeName", currentNode;
    let baseType = "addNodeType", currentType;
    let MAX_NODES = 5;
    for(node=0; node<MAX_NODES; ++node) {
        currentNode = baseNode + node;
        currentType = baseType + node;
        if(req.body[currentNode]) {
            nodeNames.push(req.body[currentNode]);
            nodeTypes.push(req.body[currentType]);
        }
    }

    let numNodes = nodeNames.length;
    let received = 0, responses = [];
    let nodeInfo;
    for(node=0; node<numNodes; ++node) {
        nodeInfo = {};
        nodeInfo.author = req.body.author;
        nodeInfo.mapID = currentGraphID;
        nodeInfo.addNodeName = nodeNames[node];
        nodeInfo.type = nodeTypes[node];
        nodeInfo.id = node;
        addNewNode(nodeInfo, currentGraphID, result => {
            responses.push(result);
            if(++received === numNodes) {
                res.send( {msg: responses});
            }
        })
    }
};

function addNewNode(nodeInfo, graphID, callback) {
    let signals = { "signals" : [
        {
            "action": "node_create",
            "type": nodeInfo.type,
            "name": nodeInfo.addNodeName
        }
    ]};

    graphCommons.graphs(graphID, graph => {
        //Don't add same node again
        let search_query = {
            "query": nodeInfo.addNodeName,
            "graph": graphID
        };
        graphCommons.nodes_search(search_query, results => {
            let i, currentNode, numNodes = results.nodes.length;
            for(i=0; i<numNodes; ++i) {
                currentNode = results.nodes[i];
                if(currentNode.name === nodeInfo.addNodeName && currentNode.nodetype.name === nodeInfo.type) {
                    callback({id: nodeInfo.id, msg: "Node already exists"});
                }
            }
            graphCommons.update_graph(currentGraphID, signals, response => {
                console.log("Added new node");
                //Database
                nodeInfo.nodeID = response.graph.signals[0].id;
                dbase.addNode(nodeInfo);
                callback({id: nodeInfo.id, msg: "Node added"});
            })
        });
    });
}

exports.addNewLink = (req, res, next) => {
    currentGraphID = req.body.mapID;
    let nodeFromName = req.body.fromName;
    let nodeFromType = req.body.fromType;
    let nodeToName = req.body.toName;
    let nodeToType = req.body.toType;
    let linkName = req.body.linkType;

    graphCommons.graphs(currentGraphID, graph => {
        getNodeInfo(nodeFromName, currentGraphID, nodeFromInfo => {
            nodeFromInfo.linkName = linkName;
            getNodeInfo(nodeToName, currentGraphID, nodeToInfo => {
                if (!nodeFromType) {
                    if (nodeFromInfo.nodes.length === 1 && nodeToInfo.nodes.length === 1) {
                        //Unique nodes
                        //Fill in info
                        req.body.toType = nodeToInfo.nodes[0].nodetype.name;
                        req.body.fromType = nodeFromInfo.nodes[0].nodetype.name;
                        if (linkExists(nodeFromInfo, req.body, graph)) {
                            res.send({msg: "Link already exists"});
                        } else {
                            createLink(req.body);
                            res.send({msg: "Link added"});
                        }
                    } else {
                        res.send({msg: "Enter types for content", errorStatus: true});
                    }
                } else {
                    if (linkExists(nodeFromInfo, req.body, graph)) {
                        res.send({msg: "Link already exists"});
                    } else {
                        createLink(req.body);
                        res.send({msg: "Link added"});
                    }
                }
            });
        });
    });
};

function getNodeInfo(nodeName, graphID, callback) {
    let search_query = {
        "query": nodeName,
        "graph": graphID
    };
    graphCommons.nodes_search(search_query, callback);
}

function linkExists(nodesFromInfo, newLinkInfo, graph) {
    //See if edges from desired node go to desired destination
    let currentNode, fromNode, toNode, edgeData, currentEdge;
    for(let i=0, numNodes = nodesFromInfo.nodes.length; i<numNodes; ++i) {
        currentNode = nodesFromInfo.nodes[i];
        edgeData = graph.edges_from(currentNode);
        for(let j=0, numEdges = edgeData.length; j<numEdges; ++j) {
            currentEdge = edgeData[j];
            fromNode = graph.get_node(currentEdge.from);
            if(fromNode.name === newLinkInfo.fromName && currentEdge.name === newLinkInfo.linkType) {
                toNode = graph.get_node(currentEdge.to);
                if(toNode.name === newLinkInfo.toName && toNode.type === newLinkInfo.toType) {
                    //Link already exists
                    newLinkInfo.edgeID = currentEdge.id;
                    newLinkInfo.fromID = currentEdge.from;
                    newLinkInfo.toID = currentEdge.to;
                    return true;
                }
            }
        }
    }

    //No link
    return false;
}

function createLink(linkInfo) {
    let signals = { "signals" : [
        {
            "action": "edge_create",
            "from_name": linkInfo.fromName,
            "from_type": linkInfo.fromType,
            "name": linkInfo.linkType,
            "to_name": linkInfo.toName,
            "to_type": linkInfo.toType
        }
    ]};
    graphCommons.update_graph(currentGraphID, signals, response => {
        console.log("Added new link");
        //Update database
        let numSignals = response.graph.signals.length;
        let signal = numSignals > 1 ? response.graph.signals[1] : response.graph.signals[0];
        linkInfo.fromNodeID = signal.from;
        linkInfo.toNodeID = signal.to;
        linkInfo.linkNodeID = signal.id;
        dbase.addLink(linkInfo);
    })
}

function getLinkInfo(linkData, map) {
    let toNode = map.get_node(linkData.to);
    let fromNode = map.get_node(linkData.from);
    let linkInfo = {};
    linkInfo.mapID = map.properties.id;
    linkInfo.fromNodeID = linkData.from;
    linkInfo.toNodeID = linkData.to;
    linkInfo.linkNodeID = linkData.id;
    linkInfo.linkName = linkData.name;
    linkInfo.node_FromName = fromNode.name;
    linkInfo.node_ToName = toNode.name;

    return linkInfo;
}

exports.deleteNode = (req, res, next) => {
    currentGraphID = req.body.mapID;

    let signals = { "signals" : [
        {
            "action": "node_delete",
            "id": req.body.nodeID
        }
    ]};

    graphCommons.graphs(currentGraphID, graph => {
        //Get all links connected to this node
        let nodeID = req.body.nodeID;
        let nodeData = graph.get_node(nodeID);
        let edgeFromData = graph.edges_from(nodeData);
        let edgeToData = graph.edges_to(nodeData);

        graphCommons.update_graph(currentGraphID, signals, response => {
            console.log("Deleted node");
            //Update any deleted links
            let i, numFrom = edgeFromData.length, numTo = edgeToData.length;
            let linkInfo, currentEdgeData;
            for(i=0; i<numFrom; ++i) {
                currentEdgeData = edgeFromData[i];
                linkInfo = getLinkInfo(currentEdgeData, graph);
                linkInfo.author = req.body.author;
                dbase.deleteLink(linkInfo);
            }
            for(i=0; i<numTo; ++i) {
                currentEdgeData = edgeToData[i];
                linkInfo = getLinkInfo(currentEdgeData, graph);
                linkInfo.author = req.body.author;
                dbase.deleteLink(linkInfo);
            }

            res.send( {msg: "Node deleted"} );
            req.body.nodeID = response.graph.signals[0].id;
            dbase.deleteNode(req.body);
        })
    })
};

exports.deleteLink = (req, res, next) => {
    currentGraphID = req.body.mapID;
    let linkName = req.body.linkType;
    let nodeFromName = req.body.fromName;
    let nodeToName = req.body.toName;
    let nodeFromType = req.body.fromType;

    let i, fromID, toID, nodeFromData, nodeToData, edgeFromData, edgeToData, edgeID;
    graphCommons.graphs(currentGraphID, graph => {
        getNodeInfo(nodeFromName, currentGraphID, nodeFromInfo => {
            nodeFromInfo.linkName = linkName;
            getNodeInfo(nodeToName, currentGraphID, nodeToInfo => {
                if (!nodeFromType) {
                    if (nodeFromInfo.nodes.length === 1 && nodeToInfo.nodes.length === 1) {
                        //Unique nodes
                        //Fill in info
                        req.body.toType = nodeToInfo.nodes[0].nodetype.name;
                        req.body.fromType = nodeFromInfo.nodes[0].nodetype.name;
                        if (linkExists(nodeFromInfo, req.body, graph)) {
                            deleteLink(currentGraphID, req.body);
                            res.send( {msg: "Link deleted"} );
                        } else {
                            res.send( {msg: "No Link Found"} );
                        }
                    } else {
                        res.send({msg: "Enter types for content", errorStatus: true});
                    }
                } else {
                    if (linkExists(nodeFromInfo, req.body, graph)) {
                        deleteLink(currentGraphID, req.body);
                        res.send( {msg: "Link deleted"} );
                    } else {
                        res.send( {msg: "No Link Found"} );
                    }
                }
            });
        });
    });
};

function deleteLink(graphID, linkInfo) {
    let signals = { "signals" : [
        {
            "action": "edge_delete",
            "id": linkInfo.edgeID,
            "from": linkInfo.fromID,
            "to": linkInfo.toID,
            "name": linkInfo.linkType
        }
    ]};
    graphCommons.update_graph(graphID, signals, response => {
        console.log("Deleted link");
        let signal = response.graph.signals[0];
        linkInfo.fromNodeID = signal.from;
        linkInfo.toNodeID = signal.to;
        linkInfo.linkNodeID = signal.id;
        dbase.deleteLink(linkInfo);
    });
}

exports.addImage = (req, res, next) => {
    //Search graph for required node
    currentGraphID = req.body.imageMapID;

    graphCommons.graphs(currentGraphID, graph => {
        currentGraph = graph;
        //Search for node
        let search_query = {
            "query": req.body.imageNodeValue,
            "graph": currentGraphID
        };
        graphCommons.nodes_search(search_query, results => {
            let numNodes = results.nodes.length;
            if(numNodes === 0) {
                res.render("update", { mapID: currentGraphID, node_Name: req.body.nodeValue, nodes: ["No nodes found"], linkData: []} );
                return;
            }
            currentNodeID = results.nodes[0].id;
            let signals = { "signals" : [
                {
                    "action": "node_update",
                    "id": currentNodeID,
                    "image": req.body.imageName
                }
            ]};

            graphCommons.update_graph(currentGraphID, signals, response => {
                res.send( {msg: "Uploaded image"} );
            })
        });
    });

};

exports.addRef = (req, res, next) => {
    //Search graph for required node
    currentGraphID = req.body.refMapID;

    graphCommons.graphs(currentGraphID, graph => {
        currentGraph = graph;
        //Search for node
        let search_query = {
            "query": req.body.refNodeValue,
            "graph": currentGraphID
        };
        graphCommons.nodes_search(search_query, results => {
            let numNodes = results.nodes.length;
            if(numNodes === 0) {
                res.render("update", { mapID: currentGraphID, node_Name: req.body.nodeValue, nodes: ["No nodes found"], linkData: []} );
                return;
            }
            currentNodeID = results.nodes[0].id;
            let signals = { "signals" : [
                {
                    "action": "node_update",
                    "id": currentNodeID,
                    "reference": req.body.refName
                }
            ]};

            graphCommons.update_graph(currentGraphID, signals, response => {
                res.send( {msg: "Uploaded reference"} );
            })
        });
    });

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
        'limit' : 20
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

function nodeInMap(map, node) {
    let i, currentNode, numNodes = map.nodes.length;
    for(i=0; i<numNodes; ++i) {
        currentNode = map.nodes[i];
        if(currentNode.name === node.name && currentNode.type === node.type) {
            return true;
        }
    }

    return false;
}

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
                //See if node already exists
                //DEBUG
                //if(nodeInMap(srcMap, currentMap.nodes[node])) continue;
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
        dataManager.mapsMerged();
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
            dataManager.rolledBack();
        });
    });

    res.send( {msg: "Creating view - please wait..."} );
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