var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var graph_id = "288bd5c8-f7e1-4bf4-945b-4a65bdfc749a";
var currentEdgeData;
var vizDataFile = require("./data/tateData.json");

var index = require('./routes/index');
var users = require('./routes/users');
var graphs = require('./routes/graphs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use('/', index);
app.use('/users', users);

app.post("/generateGraph", graphs.generateGraph);

app.post("/processUpload", graphs.processUpload);

app.post("/process_search", function(req, res) {
    graphcommons.graphs(req.body.graph_id, function(graph) {
        currentGraph = graph;
        //Search for node
        var search_query = {
            "query": req.body.nodeValue,
            "graph": req.body.graph_id
        };
        graphcommons.nodes_search(search_query, function(results) {
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
});

app.post("/process_links", function(req, res) {
    //Get index into edge data
    var index = req.body.link;
    var choice = req.body.choice;
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
            "weight": choice ? ++weight : --weight
        }
    ]};

    //Weight within limits
    weight = signals.signals[0].weight;
    console.log("New weight = ", weight);
    if(weight <=0) {
        return;
    }
    if(weight > 10) {
        return;
    }
    graphcommons.update_graph(graph_id, signals, function() {
        console.log("Updated choice");
        res.send( {msg: 'OK'} );
    })
});

app.post("/process_generate", function(req, res) {
    var manager = new dataManager(currentGraphID);
    manager.init();
    manager.preSort();
    manager.sortLinks();
    manager.sortArtists();
    manager.createNodes();

    res.render("index", {graphID: currentGraphID,
        uploadStatus: " Uploaded",
        graphStatus: " Generating graph"});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var dataManager = function(graphID) {
    //Data
    this.data = vizDataFile;
    this.numItems = this.data.length;
    this.accessKey = process.env.GRAPH_COMMONS_API_KEY;
    this.graph_id = graphID;
    this.nodesToCreate = 0;
    this.nodesCreated = 0;

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
            if(dataItem["Exhibited at"]) {
                console.log(dataItem["Exhibited at"]);
            }
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
        graphcommons.update_graph(this.graph_id, signalNode, function() {
            console.log("Node ", name, " created");
            if(--_this.nodesToCreate === 0) {
                _this.createEdges();
            }
        });
    };

    this.createEdges = function() {
        var i, j, k, dataItem, linkInfo, numLinks;
        for (i = 0; i < this.numItems; ++i) {
            dataItem = this.data[i];
            for(j=0; j<numLinkTypes; ++j) {
                linkInfo = this.getLinkInfo(dataItem, linkTypes[j]);
                if(linkInfo !== null) {
                    for(k=0, numLinks=linkInfo.length; k<numLinks; ++k) {
                        this.createGraphEdge(dataItem["Type of node"], dataItem["Node short name"], linkInfo[k].type, linkInfo[k].name, linkTypes[j]);
                    }
                }
            }
        }
    };

    this.createGraphEdge = function(fromType, fromName, toType, toName, edgeName) {
        //Create edge
        signalEdge.signals[0].from_type = fromType;
        signalEdge.signals[0].from_name = fromName;
        signalEdge.signals[0].to_type = toType;
        signalEdge.signals[0].to_name = toName;
        signalEdge.signals[0].name = edgeName;
        graphcommons.update_graph(this.graph_id, signalEdge, function() {
            console.log("Edge ", edgeName, " created");
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
    }
};
