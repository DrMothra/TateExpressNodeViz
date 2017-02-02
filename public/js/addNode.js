/**
 * Created by atg on 01/02/2017.
 */

function validateForm() {
    if($("#graphID").val() === "") {
        alert("Enter a graph ID");
        return false;
    }
    if($('#addNodeName').val() === "") {
        alert("Enter a node name");
        return false;
    }
    if($('#addNodeType').val() === "" && $('#addNewType').val() === "") {
        alert("Enter a node type");
        return false;
    }

    return true;
}

function addNewNode() {
    //Send new node info
    $('#addNodeForm').ajaxSubmit({

        error: function() {
            console.log("Error adding new node");
        },

        success: function(response) {
            console.log("Received ", response);
            $('#addStatus').html("Node added");
        }
    });
}

$(document).ready(function() {

    $('#addNewNode').on("click", function() {
        if(!validateForm()) return;
        addNewNode();
    });
});
