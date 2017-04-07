/**
 * Created by atg on 20/01/2017.
 */
//Manages the data associated with current data file

var events = require("events");
var emitter = module.exports.emitter = new events.EventEmitter();

var status = {
    CREATE: 0,
    COPY: 1
};

exports.dataManager = function(graphID, vizData, res) {
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

    this.GRAPH_STATUS = status;
    //Types - just artists for now
    var artists = [];

    //Signalling
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

    this.nodeQueue = [];
    this.nodeRequestTime = 200;
    this.canCreateNode = true;
    this.edgeQueue = [];
    this.edgeRequestTime = 200;
    this.canCreateEdge = true;

    //Init
    this.init = function(gc) {
        this.graphCommons = gc;
        this.nodesToCreate = 0;
        this.nodesCreated = 0;
        this.edgesToCreate = 0;
        this.edgesCreated = 0;
        this.nodeTypes = [];
        this.edgeTypes = [];
        this.graphComplete = false;
        this.status = this.GRAPH_STATUS.CREATE;
    };

    this.setFileData = function(file) {
        this.data = file;
        this.numItems = this.data.length;
    };

    this.setGraphID = function(graphID) {
        this.graph_id = graphID;
    };

    this.setCurrentGraph = function(graph) {
        this.currentGraph = graph;
    };

    this.setStatus = function(status) {
        this.status = status;
    };

    this.copyTypes = function() {
        //Create types from current graph
        if(this.currentGraph !== undefined) {
            var nodeTypes = this.currentGraph.properties.nodeTypes;
            var i, numTypes = nodeTypes.length, nodeTypeInfo;
            for(i=0; i<numTypes; ++i) {
                nodeTypeInfo = {};
                nodeTypeInfo.id = nodeTypes[i].id;
                nodeTypeInfo.name = nodeTypes[i].name;
                this.nodeTypes.push(nodeTypeInfo);
            }
            var edgeTypes = this.currentGraph.properties.edgeTypes, edgeTypeInfo;
            numTypes = edgeTypes.length;
            for(i=0; i<numTypes; ++i) {
                edgeTypeInfo = {};
                edgeTypeInfo.id = edgeTypes[i].id;
                edgeTypeInfo.name = edgeTypes[i].name;
                this.edgeTypes.push(edgeTypeInfo);
            }
        }
    };

    this.getToType = function(id) {
        var i, numTypes = this.edgeTypes.length;
        for(i=0; i<numTypes; ++i) {
            if(id === this.edgeTypes[i].id) {
                return this.edgeTypes[i].name;
            }
        }

        return undefined;
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
        exports.emitter.emit("NodesToCreate", this.nodesToCreate);
    };

    this.setNumberNodesToCreate = function(numNodes) {
        this.nodesToCreate = numNodes;
        exports.emitter.emit("NodesToCreate", this.nodesToCreate);
    };

    this.onNodeCreateComplete = function() {
        console.log("All nodes created");
    };

    this.setNumberEdgesToCreate = function(numEdges) {
        this.edgesToCreate = numEdges;
        exports.emitter.emit("EdgesToCreate", this.edgesToCreate);
    };

    this.onEdgeCreateComplete = function() {
        console.log("All edges created");
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
        //Start node timer running
        this.nodeRequestTimer = setInterval(() => {
            this.createGraphNode();
        }, this.nodeRequestTime);

        for(i=0; i<this.numItems; ++i) {
            dataItem = this.data[i];
            if(dataItem["Type of node"]) {
                this.queueGraphNodeRequest(dataItem["Type of node"], dataItem["Node short name"], dataItem["Description"]);
            }
        }
    };

    this.queueGraphNodeRequest = function(type, name, description) {
        //Create queue of node requests
        //DEBUG
        console.log("Queued node request");
        var signal = JSON.parse(JSON.stringify(signalNode));
        signal.signals[0].type = type;
        signal.signals[0].name = name;
        signal.signals[0].description = description;
        this.nodeQueue.push(signal);
    };

    this.createGraphNode = function() {
        var _this = this;
        if(this.canCreateNode && this.nodeQueue.length > 0) {
            this.canCreateNode = false;
            var signalNode = this.nodeQueue.pop();
            this.graphCommons.update_graph(this.graph_id, signalNode, function() {
                console.log("Node ", ++_this.nodesCreated, signalNode.signals[0].name, " created");
                exports.emitter.emit("NodeCreated", _this.nodesCreated);
                _this.canCreateNode = true;
                if(--_this.nodesToCreate === 0) {
                    clearInterval(_this.nodeRequestTimer);
                    //DEBUG
                    console.log("All nodes created");
                    //
                    if(_this.status === _this.GRAPH_STATUS.CREATE) {
                        _this.createEdges();
                    } else {
                        _this.onNodeCreateComplete();
                    }
                }
            });
        }

    };

    this.copyGraphNodes = function(nodes, dataType, onCompletion) {
        //Create nodes according to type
        this.onNodeCreateComplete = onCompletion !== undefined ? onCompletion : this.onNodeCreateComplete;
        switch(dataType) {
            case 'json':
                var i, currentNode, numNodes = nodes.length;
                if(numNodes === 0) {
                    this.onNodeCreateComplete();
                    break;
                }
                for(i=0; i<numNodes; ++i) {
                    currentNode = nodes[i];
                    this.queueGraphNodeRequest(currentNode.type, currentNode.name, currentNode.description);
                }
                break;

            case 'csv':
                break;

            default:
                break;
        }
    };

    this.copyGraphEdges = function(nodes, onCompletion) {
        this.onEdgeCreateComplete = onCompletion !== undefined ? onCompletion : this.onEdgeCreateComplete;
        //Get edge information from this node
        var i, currentNode, toNode, edgesFrom, edge, numEdges = 0, numNodes = nodes.length;
        for(i=0; i<numNodes; ++i) {
            currentNode = this.currentGraph.get_node(nodes[i].id);
            edgesFrom = this.currentGraph.edges_from(currentNode);
            //DEBUG
            //console.log("Edges from = ", edgesFrom);
            //Get to types and names
            if(edgesFrom.length !== 0) {
                for(edge=0; edge<edgesFrom.length; ++edge) {
                    toNode = this.currentGraph.get_node(edgesFrom[edge].to);
                    ++numEdges;
                    this.queueGraphEdgeRequest(nodes[i].type, nodes[i].name, toNode.type, toNode.name, edgesFrom[edge].name);
                }
            }
        }
        this.edgesToCreate = numEdges;
        if(numEdges === 0) {
            this.graphComplete = true;
            exports.emitter.emit("GraphCompleted", "Graph Completed");
            this.onEdgeCreateComplete();
        }
    };

    this.createEdges = function() {
        var i, j, k, dataItem, linkInfo, numLinks, edges=0;
        //Start edge timer
        this.edgeRequestTimer = setInterval(() => {
            this.createEdge();
        }, this.edgeRequestTime);

        for (i = 0; i < this.numItems; ++i) {
            dataItem = this.data[i];
            for(j=0; j<numLinkTypes; ++j) {
                linkInfo = this.getLinkInfo(dataItem, linkTypes[j]);
                if(linkInfo !== null) {
                    for(k=0, numLinks=linkInfo.length; k<numLinks; ++k) {
                        ++edges;
                        this.queueGraphEdgeRequest(dataItem["Type of node"], dataItem["Node short name"], linkInfo[k].type, linkInfo[k].name, linkTypes[j]);
                    }
                }
            }
        }
        this.edgesToCreate = edges;
        //DEBUG
        console.log("Need to create ", this.edgesToCreate, " edges");
        exports.emitter.emit("EdgesToCreate", this.edgesToCreate);
    };

    this.queueGraphEdgeRequest = function(fromType, fromName, toType, toName, edgeName) {
        //Create edge
        //DEBUG
        console.log("Queued edge request");
        var signal = JSON.parse(JSON.stringify(signalEdge));
        signal.signals[0].from_type = fromType;
        signal.signals[0].from_name = fromName;
        signal.signals[0].to_type = toType;
        signal.signals[0].to_name = toName;
        signal.signals[0].name = edgeName;
        this.edgeQueue.push(signal);
    };

    this.createEdge = function() {
        var _this = this;
        if(this.canCreateEdge && this.edgeQueue.length > 0) {
            this.canCreateEdge = false;
            var edgeNode = this.edgeQueue.pop();
            this.graphCommons.update_graph(this.graph_id, edgeNode, function() {
                console.log("Edge ", _this.edgesCreated, edgeNode.signals[0].name, " created");
                ++_this.edgesCreated;
                exports.emitter.emit("EdgeCreated", _this.edgesCreated);
                _this.canCreateEdge = true;
                if(_this.edgesCreated === _this.edgesToCreate) {
                    console.log("All edges created");
                    clearInterval(_this.edgeRequestTimer);
                    _this.graphComplete = true;
                    exports.emitter.emit("GraphCompleted", "Graph Completed");
                    _this.onCompleted();
                }
            })
        }
    };

    this.createNodesAndEdges = function(completedCallback) {
        this.onCompleted = completedCallback || this.onEdgeCreateComplete;
        this.preSort();
        this.sortLinks();
        this.sortArtists();
        this.createNodes();
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
            if(!type) {
                console.log("No type for ", entries[i]);
                continue;
            }
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

    this.transmit = function() {

    };

    this.graphCompleted = function() {
        return this.graphComplete;
    }
};
