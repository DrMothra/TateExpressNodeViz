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
    var params = new URLSearchParams(window.location.search);
    var mapID = params.get('mapID');
    var mapName = params.get('name');

    //Ensure we have graph
    if(!mapID || !mapName) {
        alert("Select a map to modify from the Home page!");
        window.location.href = "/showGraphs";
        return;
    }

    $('#mapName').html(mapName);

    $('.getMapID').val(mapID);
    $('.getMapName').val(mapName);
});

