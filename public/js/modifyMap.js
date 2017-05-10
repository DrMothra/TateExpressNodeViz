/**
 * Created by DrTone on 10/02/2017.
 */


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
    let author = params.get('author');

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
    })
});

