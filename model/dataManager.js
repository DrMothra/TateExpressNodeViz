/**
 * Created by atg on 20/01/2017.
 */
//Manages the data associated with current data file

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

    //Init
    this.init = function(graphID, vizData, res) {
        this.graph_id = graphID;
        //Data
        this.data = vizData;
        this.numItems = this.data.length;
        this.response = res;
        this.nodesToCreate = 0;
        this.nodesCreated = 0;
        this.edgesToCreate = 0;
        this.edgesCreated = 0;
        this.graphComplete = false;
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
                _this.onCompleted();
            }
        })
    };

    this.createNodesAndEdges = function(completedCallback) {
        this.preSort();
        this.sortLinks();
        this.sortArtists();
        this.createNodes();
        this.onCompleted = completedCallback;
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
