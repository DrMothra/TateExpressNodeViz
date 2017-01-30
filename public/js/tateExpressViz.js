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
            var id = {
                id: 6,
                status: 'OK'
            };
            var graphData = {method: "POST",
                        data: id,
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
    socketManager.listen("NodesToCreate", "nodesToCreate");
    socketManager.listen("NewNodeCreated", "nodesCreated");

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