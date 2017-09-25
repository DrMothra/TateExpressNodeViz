/**
 * Created by DrTone on 02/02/2017.
 */

let graphNodeNames, graphNodeTypes, graphLinkTypes;
let submitted = false;

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

    let fromName = $('#fromNodeName').val();
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
        let fromType = elem.val();
        if(fromType === "") {
            alert('"From Type" is empty!');
            return false;
        }
        if(graphNodeTypes.indexOf(fromType) < 0) {
            alert("Enter a valid from type");
            return false;
        }
    }

    let toName = $('#toNodeName').val();
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
        let toType = elem.val();
        if(toType === "") {
            alert('"To Node Type" box is empty!');
            return false;
        }
        if(graphNodeTypes.indexOf(toType) < 0) {
            alert("Enter a valid to type");
            return false;
        }
    }

    let newType = $('#linkType').val();
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

    let waitStatus = $('#waitStatus');
    waitStatus.show();
    let errorStatus = $('#errorStatus');

    if(submitted) {
        console.log("Already submitted");
        return;
    }
    submitted = true;
    $('#addLinkForm').ajaxSubmit({

        error: function() {
            submitted = false;
            console.log("Error adding new node");
            waitStatus.hide();
            errorStatus.show();
        },

        success: function(response) {
            submitted = false;
            console.log("Received ", response);
            let status = $('#addStatus');
            status.show();
            status.html(response.msg);
            waitStatus.hide();
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

