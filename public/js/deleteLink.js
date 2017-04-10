/**
 * Created by DrTone on 01/03/2017.
 */

var graphNodeNames, graphLinkTypes;

function validateForm() {
    if($("#mapID").val() === "") {
        alert("Enter a map ID");
        return false;
    }

    var fromName = $('#node_FromName').val();
    if(fromName === "") {
        alert("Enter from node name");
        return false;
    }
    if(graphNodeNames.indexOf(fromName) < 0) {
        alert("From node not in graph!");
        return false;
    }

    var toName = $('#node_ToName').val();
    if(toName === "") {
        alert("Enter to node name");
        return false;
    }
    if(graphNodeNames.indexOf(toName) < 0) {
        alert("To node not in graph!");
        return false;
    }

    var linkName = $('#linkName').val();
    if(linkName === "") {
        alert("Enter a link name");
        return false;
    }
    if(graphLinkTypes.indexOf(linkName) < 0) {
        alert("Link not in graph!");
        return false;
    }

    return true;
}

function onGetLinkTypes(response) {
    //Populate list of types
    graphLinkTypes = response.msg;
    $('#linkName').typeahead( {source: graphLinkTypes} );
}

function onGetNodeNames(response) {
    //Populate list of nodes
    graphNodeNames = response.msg;
    $('#node_FromName').typeahead( {source: graphNodeNames} );
    $('#node_ToName').typeahead( {source: graphNodeNames} );
}

function deleteALink() {
    //Add author info
    $('#author').val(localStorage.getItem("TateUsername"));

    $('#deleteLinkForm').ajaxSubmit({

        error: function() {
            console.log("Error deleting link");
        },

        success: function(response) {
            console.log("Received ", response);
            $('#addStatus').html("Link deleted");
        }
    });
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
        return;
    }
    let mapManager = new MapManager();
    mapManager.getGraphNodeNames(mapID, onGetNodeNames);
    mapManager.getGraphLinkTypes(mapID, onGetLinkTypes);

    $('#linkDelete').on("click", function() {
        if(!validateForm()) return;
        deleteALink();
    });

    $("#backToModify").on("click", function () {
        onBack();
    });
});
