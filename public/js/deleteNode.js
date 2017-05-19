/**
 * Created by DrTone on 23/02/2017.
 */

let graphNodeNames, nodeData, currentNode;
let mapManager;

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
    let index = id.match(/\d/g);
    index = index.join("");
    if(isNaN(index)) {
        alert("Invalid map selected!");
        return;
    }
    currentNode = nodeData[index];

    //DEBUG
    console.log("Node = ", currentNode.name);
}

function onNodeDeleted() {
    $('#addStatus').show();
    $('#addStatus').html("Node deleted");
}

function deleteNode() {
    if(!currentNode) {
        alert("No node selected!");
        return;
    }
    let mapID = $('#mapID').val();
    if(!mapID) {
        alert("No map ID specified!");
        return;
    }

    let nodeInfo = {};
    nodeInfo.mapID = mapID;
    nodeInfo.id = currentNode.id;
    nodeInfo.name = currentNode.name;
    mapManager.deleteNode(nodeInfo, onNodeDeleted);
    currentNode = undefined;
}

function onFindNodes() {
    //Create list of potential nodes to delete
    if(validateForm()) {
        //Clear any previous search
        var elem = $('#nodeList');
        elem.empty();
        $('#addStatus').hide();
        $('#findNodesForm').ajaxSubmit({

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
                $('#nodes').show();
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
    if($('#mapID').val() === "") {
        alert("Enter a map ID");
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

function onGetNodeNames(response) {
    //Populate list of nodes
    graphNodeNames = response.msg;
    $('#node_Name').typeahead( {source: graphNodeNames} );
}

function onBack() {
    var mapID = $('#mapID').val();
    var name = $('#mapName').html();
    window.location.href = "/modifyMap?mapID="+mapID+"&name="+name;
}

$(document).ready(function() {
    //Autocomplete
    let mapID = $('#mapID').val();
    if(!mapID) {
        alert("No map ID specified!");
    }

    mapManager = new MapManager();
    mapManager.getGraphNodeNames(mapID, onGetNodeNames);

    $('#find').on("click", function() {
        $('#nodes').hide();
        onFindNodes();
    });

    $('#nodeDelete').on("click", function() {
        deleteNode();
    });

    $("#backToModify").on("click", function () {
        onBack();
    });

    let author;
    $('#backToViews').on("click", () => {
        author = localStorage.getItem("CurrentAuthor");
        window.location.href = "/showViews?authorName="+author;
    });
});

