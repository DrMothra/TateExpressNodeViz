/**
 * Created by DrTone on 15/12/2016.
 */

var graphManager = (function() {
    var currentGraphID = undefined;
    var processing = false;

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

    return {
        init: function() {

        },

        createNewGraph: function() {
            //Ensure we have graph name
            var name = $('#graphName').val();
            if(!name) {
                alert("Enter a graph name");
                return;
            }
            var description = $('#graphdescription').val();
            var graphInfo = {
                name: name,
                description: description
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
    socketManager.connect("http://localhost", 3000);
    var messages = [
        {msg: "NodesToCreate", element: "nodesToCreate"},
        {msg: "NewNodeCreated", element: "nodesCreated"},
        {msg: "EdgesToCreate", element: "edgesToCreate"},
        {msg: "NewEdgeCreated", element: "edgesCreated"},
        {msg: "GraphComplete", element: "graphStatus"}
    ];
    var i, numMessages = messages.length, msg;
    for(i=0; i<numMessages; ++i) {
        msg = messages[i];
        socketManager.listen(msg.msg, msg.element);
    }

    //GUI callbacks
    $("#create").on("click", function() {
        graphManager.createNewGraph();
    });

    $("[id*='yesLink']").on("click", function() {
        graphManager.updateLinkInfo(this.id, 1);
    });

    $("[id*='noLink']").on("click", function() {
        graphManager.updateLinkInfo(this.id, 0);
    });

    $('#generate').on("click", function() {
        graphManager.generateGraph();
    });
});