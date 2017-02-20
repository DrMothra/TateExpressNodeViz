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

    function onGraphCreated(response) {s
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

        var graphData = {
            method: "POST",
            data: graphInfo,
            url: '/copyGraph',
            dataType: 'JSON'};

        sendData(graphData, onGraphCopied);
    }

    function onGraphCopied() {
        //DEBUG
        console.log("Graph copied");
    }

    function onGraphsFound(response) {
        //DEBUG
        console.log("Graphs = ", response);
        var i, graphInfo, numGraphs = response.msg.length;

        //General graphs
        var graphElem;
        for(i=0; i<numGraphs; ++i) {
            graphInfo = response.msg[i];
            graphElem = $('#graphList');
            if(graphInfo.author !== "TonyG") {
                mainGraphList.push(graphInfo);
                graphElem.append("<div class='row graphInfo'>" +
                    "<div class='col-md-2'>" + graphInfo.name + "</div>" +
                    "<div class='col-md-3'>" + graphInfo.graphID + "</div>" +
                    "<div class='col-md-1'>" + graphInfo.author + "</div>" +
                    "<div class='col-md-2'> <button type='button' class='btn btn-primary' data-toggle='tooltip' data-placement='top' title='Copy graph to your account'>Copy</button></div>" +
                    "</div>");
            } else {
                yourGraphList.push(graphInfo);
                graphElem = $('#yourGraphList');
                graphElem.append("<div class='row graphInfo'>" +
                    "<div class='col-md-2'>" + graphInfo.name + "</div>" +
                    "<div class='col-md-3'>" + graphInfo.graphID + "</div>" +
                    "<div class='col-md-2'> <button type='button' class='btn btn-primary' data-toggle='tooltip' data-placement='top' title='Modify this graph'>Modify</button></div>" +
                    "</div>");
            }
        }
        //Set ids for buttons
        $('#graphList button').attr("id", function(index, old) {
            return 'copyGraph' + index;
        });

        $('#yourGraphList button').attr("id", function(index, old) {
            return 'modGraph' + index;
        });

        $("[id^='modGraph']").on("click", function() {
            onModifyGraph(this.id);
        });

        $("[id^='copyGraph']").on("click", function() {
            onCopyGraph(this.id);
        });
    }

    return {
        init: function() {

        },

        getGraphs: function() {
            //Get all graphs in account
            var searchInfo = {
                query: "TateCartographyProject"
            };
            var graphData = {method: "POST",
                data: searchInfo,
                url: '/processSearch',
                dataType: 'JSON'};

            sendData(graphData, onGraphsFound);
        },

        createNewGraph: function() {
            //Ensure we have graph name
            var name = $('#graphName').val();
            if(!name) {
                alert("Enter a graph name");
                return;
            }
            var description = $('#graphdescription').val();
            if(description === undefined) description = "";
            var graphInfo = {
                name: name,
                subtitle: "TateCartographyProject",
                description: 'Author="TonyG"' + description
            };
            var graphData = {method: "POST",
                        data: graphInfo,
                        url: '/createGraph',
                        dataType: 'JSON'};

            sendData(graphData, onGraphCreated);
        },

        generateGraph: function() {
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

        updateLinkInfo: function(linkID, choice) {
            //Strip out id
            var id = linkID.charAt(0);
            var linkData = {
                link: id,
                choice: choice
            };
            var graphData = {
                method: "POST",
                data: linkData,
                url: '/processLinks',
                dataType: 'JSON'
            };
            sendData(graphData);
        }
    }
})();

$(document).ready(function() {

    //Socket io
    if(socketManager === undefined) {
        socketManager = new SocketManager();
        socketManager.connect("http://localhost", 3000);
        var messages = [
            {msg: "NodesToCreate", element: "nodesToCreate"},
            {msg: "NewNodeCreated", element: "nodesCreated"},
            {msg: "EdgesToCreate", element: "edgesToCreate"},
            {msg: "NewEdgeCreated", element: "edgesCreated"},
            {msg: "GraphCompleted", element: "graphStatus"}
        ];
        var i, numMessages = messages.length, msg;
        for(i=0; i<numMessages; ++i) {
            msg = messages[i];
            socketManager.listen(msg.msg, msg.element);
        }
    }

    //GUI callbacks
    graphManager.getGraphs();

    $("#create").on("click", function() {
        graphManager.createNewGraph();
    });

    $('#generate').on("click", function() {
        graphManager.generateGraph();
    });

});