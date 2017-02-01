/**
 * Created by atg on 01/02/2017.
 */


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
        addNewNode();
    });
});
