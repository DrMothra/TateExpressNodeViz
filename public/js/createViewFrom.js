/**
 * Created by DrTone on 25/04/2017.
 */


function validateForm() {
    let mapName = $('#mapName').val();
    if(!mapName) {
        alert("Enter a map name");
        return;
    }

    let mapDescription = $('#mapDescription').val();
    if(mapDescription === undefined) {
        mapDescription = "";
    }

    let author = localStorage.getItem("TateUsername");
    mapDescription = 'Author"' + author + '"' + mapDescription;
    $('#mapDescription').val(mapDescription);

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
    mapID = params.get('mapID');

    //Map manager
    let mapManager = new MapManager();

    $('#createViewFrom').on("click", () => {
        validateForm();
    });

    $('#myViews').on("click", ()=> {
        window.location.href = "/showMyViews?authorName=" + localStorage.getItem("TateUsername");
    });
});
