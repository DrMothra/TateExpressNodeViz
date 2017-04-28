/**
 * Created by DrTone on 25/04/2017.
 */


function validateForm(mapID) {

    let mapDescription = $('#mapDescription').val();
    if(mapDescription === undefined) {
        mapDescription = "";
    }

    let author = localStorage.getItem("TateUsername");
    mapDescription = 'Author"' + author + '"' + mapDescription;
    $('#mapDescription').val(mapDescription);
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
        validateForm(mapID);
    });

    $('#myViews').on("click", ()=> {
        window.location.href = "/showMyViews?authorName=" + localStorage.getItem("TateUsername");
    });
});
