/**
 * Created by DrTone on 10/02/2017.
 */

function validateForm(mapID) {
    //See if we can delete this map
    let currentAuthor = localStorage.getItem("CurrentAuthor");
    let userName = localStorage.getItem("TateUsername");
    if(currentAuthor !== userName) {
        alert("You can only delete your own maps!");
        return false;
    }
    return true;
}

function deleteMap(mapID) {
    $('#mapID').val(mapID);

    $('#deleteForm').ajaxSubmit({

        error: function() {
            console.log("Error deleting map");
        },

        success: function(response) {
            //Go back to views
            let author = localStorage.getItem("CurrentAuthor");
            window.location.href = "/showViews?authorName="+author;
        }
    });
}

$(document).ready(function() {
    //Check that logged in
    if(!LoginManager.userLoggedIn()) {
        alert("Please log in before continuing!");
        window.location.href = "/";
        return;
    }

    //Fill in url query params
    let params = new URLSearchParams(window.location.search);
    let mapID = params.get('mapID');
    let mapName = params.get('name');
    let author = localStorage.getItem("CurrentAuthor");
    if(!author) {
        console.log("No current author!");
    }

    //Ensure we have graph
    if(!mapID || !mapName) {
        alert("Select a map to modify from the Home page!");
        window.location.href = "/showGraphs";
        return;
    }

    $('#mapName').html(mapName);

    $('.getMapID').val(mapID);
    $('.getMapName').val(mapName);

    $('#backToViews').on("click", () => {
        window.location.href = "/showViews?authorName="+author;
    });

    $('#deleteForm').on("click", () => {
        if(validateForm()) {
            if(confirm("Are you sure you want to delete this map?")) {
                deleteMap(mapID);
            }
        }
    });

});

