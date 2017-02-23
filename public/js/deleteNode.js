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

    $('#searchForm').on("submit", function() {
        return validateForm();
    });

});

