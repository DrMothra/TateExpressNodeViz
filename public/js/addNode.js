/**
 * Created by atg on 01/02/2017.
 */

let mapNodeTypes, mapNodeNames;

function onGetNodeTypes(response) {
    //Populate list of types
    mapNodeTypes = response.msg;
    $('#addNodeType').typeahead( {source: mapNodeTypes} );
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
            $('#addStatus').show();
            $('#addStatus').html(response.msg);
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
    mapManager.getGraphNodeNames(mapID, response => {
        mapNodeNames = response.msg;
    });

    $('#addNewNode').on("click", function() {
        if(!validateForm()) return;
        $('#addStatus').hide();
        addNewNode();
    });

    $("#backToModify").on("click", () => {
        onBack();
    });

    let author;
    $('#backToViews').on("click", () => {
        author = localStorage.getItem("CurrentAuthor");
        window.location.href = "/showViews?authorName="+author;
    });
});
