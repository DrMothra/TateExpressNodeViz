/**
 * Created by atg on 20/01/2017.
 */
//Manages the data associated with current data file

var events = require("events");
var emitter = module.exports.emitter = new events.EventEmitter();

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
        this.graphComplete = false;
    };

    this.setFileData = function(file) {
        this.data = file;
        this.numItems = this.data.length;
    };

    this.setGraphID = function(graphID) {
        this.graph_id = graphID;
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
        var _this = this;
        this.nodeRequestTimer = setInterval(function() {
            _this.createGraphNode();
        }, this.nodeRequestTime);
    };

    this.createGraphNode = function() {
        var _this = this;
        if(this.canCreateNode && this.nodeQueue.length > 0) {
            this.canCreateNode = false;
            var signalNode = this.nodeQueue.pop();
            this.graphCommons.update_graph(this.graph_id, signalNode, function() {
                console.log("Node ", ++_this.nodesCreated, signalNode.signals[0].name, " created");
                exports.emitter.emit("NodeCreated");
                _this.canCreateNode = true;
                if(--_this.nodesToCreate === 0) {
                    clearInterval(_this.nodeRequestTimer);
                    //DEBUG
                    console.log("All nodes created");
                    _this.createEdges();
                }
            });
        }

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
                        this.queueGraphEdgeRequest(dataItem["Type of node"], dataItem["Node short name"], linkInfo[k].type, linkInfo[k].name, linkTypes[j]);
                    }
                }
            }
        }
        this.edgesToCreate = edges;
        //DEBUG
        console.log("Need to create ", this.edgesToCreate, " edges");
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
        var _this = this;
        this.edgeRequestTimer = setInterval(function () {
            _this.createEdge();
        }, this.edgeRequestTime);
    };

    this.createEdge = function() {
        var _this = this;
        if(this.canCreateEdge && this.edgeQueue.length > 0) {
            this.canCreateEdge = false;
            var edgeNode = this.edgeQueue.pop();
            this.graphCommons.update_graph(this.graph_id, edgeNode, function() {
                console.log("Edge ", _this.edgesCreated, edgeNode.signals[0].name, " created");
                ++_this.edgesCreated;
                _this.canCreateEdge = true;
                if(_this.edgesCreated === _this.edgesToCreate) {
                    console.log("All edges created");
                    clearInterval(_this.edgeRequestTimer);
                    _this.graphComplete = true;
                    _this.onCompleted();
                }
            })
        }
    };

    this.createNodesAndEdges = function(completedCallback) {
        this.onCompleted = completedCallback;
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

    this.transmit = function() {

    },

    this.graphCompleted = function() {
        return this.graphComplete;
    }
};
