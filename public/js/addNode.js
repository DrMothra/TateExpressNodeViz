/**
 * Created by atg on 01/02/2017.
 */

let graphNodeTypes;

function onGetNodeTypes(response) {
    //Populate list of types
    graphNodeTypes = response.msg;
    $('#addNodeType').typeahead( {source: graphNodeTypes} );
}

function validateForm() {
    if($("#mapID").val() === "") {
        alert("Enter a map ID");
        return false;
    }

    let nodeName = $('#addNodeName').val();
    if(nodeName === "") {
        alert("Enter a node name");
        return false;
    }

    let nodeType = $('#addNodeType').val();
    if(nodeType === "") {
        alert("Enter a node type");
        return false;
    }

    return true;
}

function addNewNode() {
    //Send new node info
    //Add author info
    $('#author').val(localStorage.getItem("TateUsername"));

    $('#addNodeForm').ajaxSubmit({

        error: function() {
            console.log("Error adding new node");
        },

        success: function(response) {
            console.log("Received ", response);
            $('#addStatus').html("Node added");
        }
    });
}

function onBack() {
    let mapID = $('#mapID').val();
    let name = $('#mapName').html();
    window.location.href = "/modifyMap?mapID="+mapID+"&name="+name;
}

$(document).ready(function() {
    let mapManager = new MapManager();
    let mapID = $('#mapID').val();
    mapManager.getGraphNodeTypes(mapID, onGetNodeTypes);

    $('#addNewNode').on("click", function() {
        if(!validateForm()) return;
        addNewNode();
    });

    $("#backToModify").on("click", function () {
        onBack();
    });
});
