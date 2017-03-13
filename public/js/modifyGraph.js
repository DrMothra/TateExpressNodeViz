/**
 * Created by DrTone on 10/02/2017.
 */


$(document).ready(function() {
    //Fill in url query params
    var params = new URLSearchParams(window.location.search);
    var graphID = params.get('graphID');
    var graphName = params.get('name');
    $('#graphID').html(graphID);
    $('#graphName').html(graphName);

    $('.getGraphID').val(graphID);
    $('.getGraphName').val(graphName);
});

