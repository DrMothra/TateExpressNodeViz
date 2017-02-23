/**
 * Created by DrTone on 23/02/2017.
 */



function validateForm() {
    if($('#graphID').val() === "") {
        alert("Enter a graph ID");
        return false;
    }

    if($('#node_Name').val() === "") {
        alert("Enter a node name");
        return false;
    }

    return true;
}

$(document).ready(function() {
    //Get url parameters
    var params = new URLSearchParams(window.location.search);
    var graphID = params.get('deleteNodeGraphID');
    $('#graphID').val(graphID);

    $('#searchForm').on("submit", function() {
        return validateForm();
    });

});

