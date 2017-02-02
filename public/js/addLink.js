/**
 * Created by DrTone on 02/02/2017.
 */


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
        addNewLink();
    });
});

