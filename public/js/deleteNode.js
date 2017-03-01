/**
 * Created by DrTone on 23/02/2017.
 */

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

function onDeleteNodes() {
    //Create list of potential nodes to delete
    if(validateForm()) {
        $('#searchForm').ajaxSubmit({

            error: function() {
                console.log("Error");
            },

            success: function(response) {
                //Populate nodes
                var numNodes = response.msg.length;
                if(numNodes === 0) {
                    $('#numNodes').html("No nodes found");
                    return;
                }
                var i, node, elem = $('#nodeList');
                for(i=0; i<numNodes; ++i) {
                    node = response.msg[i];
                    elem.append("<div class='row'>" +
                            "<div class='col-md-3'>" + node + "</div>" +
                            "<div class='col-md-3 checkbox'><input type='checkbox'></div>" +
                            "</div>");
                }
                //Set up ids for checkboxes
                
            }
        })
    }
}

function validateForm() {
    if($('#graphID').val() === "") {
        alert("Enter a graph ID");
        return false;
    }

    if($('#node_Name').val() === "") {
        alert("Enter a node name");
        return false;
    }

    return true;
}

function getGraphNodes() {
    //Populate list of nodes
    var graphID = $('#graphID').val();
    var nodeData = {
        graphID: graphID
    };

    var graphData = {
        method: 'post',
        data: nodeData,
        url: '/getNodes',
        dataType: 'JSON'
    };

    sendData(graphData, function(response) {
        var nodesData = response.msg;
        $('#node_Name').typeahead( {source: nodesData} );
    });
}

$(document).ready(function() {

    //Autocomplete
    getGraphNodes();

    $("[id^='deleteCheck']").on("click", function() {
        onDeleteNode(this.id);
    });

    $('#find').on("click", function() {
        onDeleteNodes();
    });
});

