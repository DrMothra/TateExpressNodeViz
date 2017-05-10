/**
 * Created by atg on 24/04/2017.
 */

function validateForm() {
    let mapName = $('#mapName').val();
    if(!mapName) {
        alert("Enter a map name");
        return false;
    }

    let mapDescription = $('#mapDescription').val();
    if(mapDescription === undefined) {
        mapDescription = "";
    }

    let author = localStorage.getItem("TateUsername");
    mapDescription = 'Author="' + author + '"' + mapDescription;
    $('#mapDescription').val(mapDescription);

    $('#uploadForm').ajaxSubmit({
        error: ()=> {
            console.log("Error submitting form");
        },

        success: response => {
            $('#mapStatus').html(" " + response.msg);
        }
    });

    return true;
}

function nodesToCreate(numNodes) {
    $('#nodesToCreate').html(numNodes);
}

function newNodeCreated(nodeNum) {
    $('#nodesCreated').html(nodeNum);
}

function linksToCreate(numLinks) {
    $('#linksToCreate').html(numLinks);
}

function newLinkCreated(linkNum) {
    $('#linksCreated').html(linkNum);
}

function onGraphCompleted() {
    $('#mapStatus').html("Map Completed");
    $('#mapCompleted').show();
}

$(document).ready( ()=> {
    let mapManager = new MapManager();

    $('#createView').on("click", ()=> {
        if(validateForm()) {
            let updates = [
                {msg: "NodesToCreate", callback: nodesToCreate},
                {msg: "NewNodeCreated", callback: newNodeCreated},
                {msg: "LinksToCreate", callback: linksToCreate},
                {msg: "NewLinkCreated", callback: newLinkCreated},
                {msg: "GraphCompleted", callback: onGraphCompleted}
            ];
            let i, numMessages = updates.length;
            for(i=0; i<numMessages; ++i) {
                mapManager.sendUpdates(updates[i].msg, updates[i].callback);
            }
        }
    });

    $('#myViews').on("click", ()=> {
        window.location.href = "/showMyViews?authorName=" + localStorage.getItem("TateUsername");
    });

});
