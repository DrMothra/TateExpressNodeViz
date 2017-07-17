/**
 * Created by DrTone on 02/02/2017.
 */

var graphNodeNames, graphNodeTypes, graphLinkTypes;

function onGetNodeNames(response) {
    //Populate list of nodes
    graphNodeNames = response.msg;
    $('#fromNodeName').typeahead( {source: graphNodeNames} );
    $('#toNodeName').typeahead( {source: graphNodeNames} );
}

function onGetNodeTypes(response) {
    //Populate list of types
    graphNodeTypes = response.msg;
    $('#fromType').typeahead( {source: graphNodeTypes} );
    $('#toType').typeahead( {source: graphNodeTypes} );
}

function onGetLinkTypes(response) {
    graphLinkTypes = response.msg;
    $('#linkType').typeahead( {source: graphLinkTypes} );
}

function validateForm() {
    if($("#mapID").val() === "") {
        alert("Enter a map ID");
        return false;
    }

    var fromName = $('#fromNodeName').val();
    if(fromName === "") {
        alert('"From Node Name" box is empty!');
        return false;
    }
    if(graphNodeNames.indexOf(fromName) < 0) {
        alert("From node not in graph!");
        return false;
    }

    //Only validate if being displayed
    let elem = $('#fromType');
    if(elem.is(":visible")) {
        var fromType = elem.val();
        if(fromType === "") {
            alert('"From Type" is empty!');
            return false;
        }
        if(graphNodeTypes.indexOf(fromType) < 0) {
            alert("Enter a valid from type");
            return false;
        }
    }

    var toName = $('#toNodeName').val();
    if(toName === "") {
        alert('"To Node Name" box is empty!');
        return false;
    }
    if(graphNodeNames.indexOf(toName) < 0) {
        alert("To node not in graph!");
        return false;
    }

    elem = $('#toType');
    if(elem.is(":visible")) {
        var toType = elem.val();
        if(toType === "") {
            alert('"To Node Type" box is empty!');
            return false;
        }
        if(graphNodeTypes.indexOf(toType) < 0) {
            alert("Enter a valid to type");
            return false;
        }
    }

    var newType = $('#linkType').val();
    if(newType === "") {
        alert("Enter a link type!");
        return false;
    }

    return true;
}

function addNewLink() {
    //Send new node info
    //Add author info
    $('#author').val(localStorage.getItem("TateUsername"));

    $('#addLinkForm').ajaxSubmit({

        error: function() {
            console.log("Error adding new node");
        },

        success: function(response) {
            console.log("Received ", response);
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
    mapManager.getGraphNodeTypes(mapID, onGetNodeTypes);
    mapManager.getGraphLinkTypes(mapID, onGetLinkTypes);

    $('#addNewLink').on("click", function() {
        if(!validateForm()) return;
        $('#addStatus').hide();
        addNewLink();
    });

    $("#backToModify").on("click",  () => {
        onBack();
    });

    let author;
    $('#backToViews').on("click", () => {
        author = localStorage.getItem("CurrentAuthor");
        window.location.href = "/showViews?authorName="+author;
    });
});

