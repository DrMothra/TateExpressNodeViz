/**
 * Created by DrTone on 23/02/2017.
 */

var graphNodeNames, nodeData, currentNode;

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

function onDeleteNode(id) {
    var index = id.slice(-1);
    currentNode = nodeData[index];

    //DEBUG
    console.log("Node = ", currentNode.name);
}

function deleteNode() {
    var graphID = $('#graphID').val();
    var nodeData = {
        graphID: graphID,
        nodeID: currentNode.id
    };

    var graphData = {
        method: 'post',
        data: nodeData,
        url: '/processDeleteNode',
        dataType: 'JSON'
    };

    sendData(graphData, function(response) {
        $('#addStatus').html("Node deleted");
    })
}

function onFindNodes() {
    //Create list of potential nodes to delete
    if(validateForm()) {
        //Clear any previous search
        var elem = $('#nodeList');
        elem.empty();
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
                nodeData = response.msg;
                var i, nodeInfo;
                for(i=0; i<numNodes; ++i) {
                    nodeInfo = response.msg[i];
                    elem.append("<div class='row'>" +
                            "<div class='col-md-3'>" + nodeInfo.name + " (" + nodeInfo.type + ")</div>" +
                            "<div class='col-md-3 checkbox'><input type='checkbox' class='deleteList'></div>" +
                            "</div>");
                }
                //Set up ids for checkboxes
                $('.deleteList').attr("id", function(index, old) {
                    return 'deleteNode' + index;
                });

                $("[id^='deleteNode']").on("click", function() {
                    onDeleteNode(this.id);
                });
            }
        })
    }
}

function validateForm() {
    if($('#graphID').val() === "") {
        alert("Enter a graph ID");
        return false;
    }

    var nodeName = $('#node_Name').val();
    if(nodeName === "") {
        alert("Enter a node name");
        return false;
    }
    if(graphNodeNames.indexOf(nodeName) < 0) {
        alert("Node not in graph!");
        return false;
    }

    return true;
}

function getGraphNodeNames() {
    //Populate list of nodes
    var graphID = $('#graphID').val();
    var nodeData = {
        graphID: graphID
    };

    var graphData = {
        method: 'post',
        data: nodeData,
        url: '/processGetNodeNames',
        dataType: 'JSON'
    };

    sendData(graphData, function(response) {
        graphNodeNames = response.msg;
        $('#node_Name').typeahead( {source: graphNodeNames} );
    });
}

function onBack() {
    var graphID = $('#graphID').val();
    var name = $('#graphName').html();
    window.location.href = "/modifyGraph?graphID="+graphID+"&name="+name;
}

$(document).ready(function() {

    //Autocomplete
    getGraphNodeNames();

    $('#find').on("click", function() {
        onFindNodes();
    });

    $('#nodeDelete').on("click", function() {
        deleteNode();
    });

    $("#backToModify").on("click", function () {
        onBack();
    });
});

