/**
 * Created by DrTone on 15/12/2016.
 */

var graphManager = (function() {
    var currentGraphID = undefined;
    var processing = false;
    var mainGraphList = [];
    var yourGraphList = [];

    function sendData(data, callback) {
        $.ajax({
            type: data.method,
            data: data.data,
            url: data.url,
            dataType: data.dataType
        }).done(function(response) {
            //DEBUG
            console.log("Data sent");
            if(callback !== undefined) {
                callback(response);
            }
        })
    }

    function onGraphCreated(response) {
        $('#graphID').html(response.msg);
    }

    function onModifyGraph(id) {
        //Get graph id
        var graphID = id.slice(-1);
        console.log("ID = ", graphID);

        var graphInfo = yourGraphList[graphID];

        window.location.href = "/modifyGraph?graphID="+graphInfo.graphID+"&name="+graphInfo.name;
    }

    function onCopyGraph(id) {
        //Get graph id
        var graphID = id.slice(-1);
        console.log("ID = ", graphID);

        var graphInfo = mainGraphList[graphID];
        graphInfo.userName = localStorage.getItem("TateUsername");

        var graphData = {
            method: "POST",
            data: graphInfo,
            url: '/processCopyGraph',
            dataType: 'JSON'};

        sendData(graphData, onGraphCopied);
        $('#graphStatus').html("Copying...");
    }

    function onGraphCopied() {
        //Refresh page
        //window.location.reload(true);
    }

    function onDeleteGraph(id) {
        var delGraph = confirm("Are you sure you want to delete this graph?");
        if(delGraph) {
            var graphID = id.slice(-1);
            var graphInfo = yourGraphList[graphID];

            var graphData = {
                method: "POST",
                data: graphInfo,
                url: '/processDeleteGraph',
                dataType: 'JSON'
            };

            sendData(graphData, function() {
                //Refresh graph status
                window.location.reload(true);
            });
        }
    }

    function onGraphsFound(response) {
        var i, graphInfo, numGraphs = response.msg.length;
        var currentUserName = localStorage.getItem("TateUsername");
        //DEBUG
        console.log("Username = ", currentUserName);

        if(currentUserName === undefined) {
            alert("You must be logged in!");
            return;
        }

        //General graphs
        var graphElem;
        var graphLink;
        for(i=0; i<numGraphs; ++i) {
            graphInfo = response.msg[i];
            graphLink = "<a href='https://graphcommons.com/graphs/" + graphInfo.graphID + "' target='_blank'>";
            graphElem = $('#graphList');
            if(graphInfo.author !== currentUserName) {
                mainGraphList.push(graphInfo);
                graphElem.append("<div class='row graphInfo'>" +
                    "<div class='col-md-2'>" + graphInfo.name + "</div>" +
                    "<div class='col-md-3'>" + graphLink + graphInfo.graphID + "</a></div>" +
                    "<div class='col-md-1'>" + graphInfo.author + "</div>" +
                    "<div class='col-md-2'> <button type='button' class='btn btn-primary' data-toggle='tooltip' data-placement='top' title='Copy graph to your account'>Copy</button></div>" +
                    "</div>");
            } else {
                yourGraphList.push(graphInfo);
                graphElem = $('#yourGraphList');
                graphElem.append("<div class='row graphInfo'>" +
                    "<div class='col-md-2'>" + graphInfo.name + "</div>" +
                    "<div class='col-md-3'>" + graphLink + graphInfo.graphID + "</a></div>" +
                    "<div class='col-md-2'><button type='button' class='btn btn-primary modify' data-toggle='tooltip' data-placement='top' title='Modify this graph'>Modify</button>" +
                        "<button type='button' class='btn btn-primary delete' data-toggle='tooltip' data-placement='top' title='Delete this graph'>Delete</button></div>" +
                    "</div>");
            }
        }
        //Set ids for buttons
        $('#graphList button').attr("id", function(index, old) {
            return 'copyGraph' + index;
        });

        $('#yourGraphList .modify').attr("id", function(index, old) {
            return 'modGraph' + index;
        });

        $('#yourGraphList .delete').attr("id", function(index, old) {
            return 'deleteGraph' + index;
        });

        $("[id^='modGraph']").on("click", function() {
            onModifyGraph(this.id);
        });

        $("[id^='deleteGraph']").on("click", function() {
            onDeleteGraph(this.id);
        });

        $("[id^='copyGraph']").on("click", function() {
            onCopyGraph(this.id);
        });
    }

    return {
        init: function() {

        },

        getGraphs: ()=> {
            //Get all graphs in account
            var searchInfo = {
                query: "TateCartographyProject"
            };
            var graphData = {method: "POST",
                data: searchInfo,
                url: '/processSearchCommons',
                dataType: 'JSON'};

            sendData(graphData, onGraphsFound);
        },

        createNewGraphID: ()=> {
            //Ensure we have graph name
            var name = $('#graphName').val();
            if(!name) {
                alert("Enter a graph name");
                return;
            }
            var description = $('#graphdescription').val();
            if(description === undefined) description = "";
            var userName = localStorage.getItem("TateUsername");
            if(userName === undefined) {
                alert("You must be logged in!");
                return;
            }
            var graphInfo = {
                name: name,
                subtitle: "TateCartographyProject",
                description: 'Author="'+userName+'"' + description
            };
            var graphData = {method: "POST",
                        data: graphInfo,
                        url: '/processGenerateNewGraphID',
                        dataType: 'JSON'};

            sendData(graphData, onGraphCreated);
        },

        createGraph: ()=> {
            //Submit data file
            $('#uploadForm').ajaxSubmit({

                error: function() {
                    console.log("error");
                },

                success: function(response) {
                    console.log("Received ", response);
                    $('#graphStatus').html(" " + response.msg);
                }
            });
        },

        graphCompleted: function() {
            //Refresh graph status
            window.location.reload(true);
        }
    }
})();

$(document).ready(function() {

    //Check that logged in
    if(!LoginManager.userLoggedIn()) {
        alert("Please log in before continuing!");
        window.location.href = "/";
        return;
    }
    //Socket io
    if(socketManager === undefined) {
        socketManager = new SocketManager();
        socketManager.connect("http://localhost", 3000);
        var messages = [
            {msg: "NodesToCreate", element: "nodesToCreate"},
            {msg: "NewNodeCreated", element: "nodesCreated"},
            {msg: "EdgesToCreate", element: "edgesToCreate"},
            {msg: "NewEdgeCreated", element: "edgesCreated"},
            {msg: "GraphCompleted", element: "graphStatus", onReceived: graphManager.graphCompleted }
        ];
        var i, numMessages = messages.length, msg;
        for(i=0; i<numMessages; ++i) {
            msg = messages[i];
            socketManager.listen(messages[i]);
        }
    }

    //GUI callbacks
    graphManager.getGraphs();

    $("#createID").on("click", function() {
        graphManager.createNewGraphID();
    });

    $('#createGraph').on("click", function() {
        graphManager.createGraph();
    });

    $('#refreshGraphs').on("click", function() {
        window.location.reload(true);
    });
});