/**
 * Created by DrTone on 01/03/2017.
 */

var graphNodeNames, graphLinkTypes;

function validateForm() {
    if($("#mapID").val() === "") {
        alert("Enter a map ID");
        return false;
    }

    let fromName = $('#fromName').val();
    if(fromName === "") {
        alert("Enter from node name");
        return false;
    }
    if(graphNodeNames.indexOf(fromName) < 0) {
        alert("From node not in graph!");
        return false;
    }

    let toName = $('#toName').val();
    if(toName === "") {
        alert("Enter to node name");
        return false;
    }
    if(graphNodeNames.indexOf(toName) < 0) {
        alert("To node not in graph!");
        return false;
    }

    let linkName = $('#linkType').val();
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
    $('#linkType').typeahead( {source: graphLinkTypes} );
}

function onGetNodeNames(response) {
    //Populate list of nodes
    graphNodeNames = response.msg;
    $('#fromName').typeahead( {source: graphNodeNames} );
    $('#toName').typeahead( {source: graphNodeNames} );
}

function onGetNodeTypes(response) {
    //Populate list of types
    graphNodeTypes = response.msg;
    $('#fromType').typeahead( {source: graphNodeTypes} );
    $('#toType').typeahead( {source: graphNodeTypes} );
}

function deleteALink() {
    //Add author info
    $('#author').val(localStorage.getItem("TateUsername"));

    $('#deleteLinkForm').ajaxSubmit({

        error: function() {
            console.log("Error deleting link");
        },

        success: function(response) {
            let status = $('#addStatus');
            status.show();
            status.html(response.msg);
            if(response.errorStatus) {
                $('#fromTypeContainer').show();
                $('#toTypeContainer').show();
            }
        }
    });
}

function onBack() {
    let mapID = $('#mapID').val();
    let name = $('#mapName').html();
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
    mapManager.getGraphNodeTypes(mapID, onGetNodeTypes);
    mapManager.getGraphLinkTypes(mapID, onGetLinkTypes);

    $('#linkDelete').on("click", function() {
        if(!validateForm()) return;
        $('#addStatus').hide();
        deleteALink();
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
