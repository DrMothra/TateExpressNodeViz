/**
 * Created by DrTone on 02/02/2017.
 */

function validateForm() {
    if($("#graphID").val() === "") {
        alert("Enter a graph ID");
        return false;
    }
    if($('#fromNodeName').val() === "") {
        alert("Enter a node name");
        return false;
    }
    if($('#fromNodeType').val() === "") {
        alert("Enter a node type");
        return false;
    }
    if($('#toNodeName').val() === "") {
        alert("Enter a node name");
        return false;
    }
    if($('#toNodeType').val() === "") {
        alert("Enter a node type");
        return false;
    }
    if($('#linkType').val() === "") {
        alert("Enter a link type");
        return false;
    }

    return true;
}

function addNewLink() {
    //Send new node info
    $('#addLinkForm').ajaxSubmit({

        error: function() {
            console.log("Error adding new node");
        },

        success: function(response) {
            console.log("Received ", response);
            $('#addStatus').html("Link added");
        }
    });
}

$(document).ready(function() {

    $('#addNewLink').on("click", function() {
        if(!validateForm()) return;
        addNewLink();
    });
});

