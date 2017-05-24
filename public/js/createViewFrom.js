/**
 * Created by DrTone on 25/04/2017.
 */


function createViewFrom(mapID) {
    let author = localStorage.getItem("TateUsername");
    $('#author').val(author);
    $('#mapID').val(mapID);

    $('#newViewForm').ajaxSubmit({
        error: ()=> {
            console.log("Error submitting form");
        },

        success: response => {
            $('#mapStatus').html(" " + response.msg);
        }
    });
}

function onViewCreated(response) {
    $('#mapStatus').html(" " + response);
}

$(document).ready( ()=> {
    //Fill in url query params
    let params = new URLSearchParams(window.location.search);
    let mapName = params.get('mapName');
    if(!mapName) {
        alert("No map name entered!");
        return;
    }
    let mapID = params.get("mapID");
    if(!mapID) {
        alert("No map ID entered!");
        return;
    }
    let editID = params.get('editID');
    if(!editID) {
        alert("No map ID!");
        return;
    }

    $('#mapName').html(mapName);
    $('#editID').val(editID);

    //Map manager
    let mapManager = new MapManager();

    $('#createViewFrom').on("click", () => {
        let updates = [
            {msg: "ViewCreated", callback: onViewCreated}
        ];
        let i, numMessages = updates.length;
        for(i=0; i<numMessages; ++i) {
            mapManager.sendUpdates(updates[i].msg, updates[i].callback);
        }
        createViewFrom(mapID);
    });

    let author = localStorage.getItem("TateUsername");

    $('#backToViews').on("click", () => {
        window.location.href = "/showViews?authorName="+author;
    });
});
