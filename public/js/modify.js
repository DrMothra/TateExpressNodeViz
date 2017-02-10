/**
 * Created by DrTone on 10/02/2017.
 */


$(document).ready(function() {
    //Fill in url query params
    var params = new URLSearchParams(window.location.search);
    var graphID = params.get('graphID');
    $('#graphID').html(graphID);
    $('#graphName').html(params.get('name'));

    $('.getGraphID').val(graphID);
});

