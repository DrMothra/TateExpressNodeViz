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
    var graphID = params.get('graphID');
    var graphName = params.get('name');

    //Ensure we have graph
    if(!graphID || !graphName) {
        alert("Select a graph to modify from the Home page!");
        window.location.href = "/showGraphs";
        return;
    }

    $('#graphID').html(graphID);
    $('#graphName').html(graphName);

    $('.getGraphID').val(graphID);
    $('.getGraphName').val(graphName);
});

