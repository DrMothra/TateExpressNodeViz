/**
 * Created by DrTone on 14/02/2017.
 */

function validateForm() {
    if($('#userName').val() === "") {
        alert("Enter a user name");
        return false;
    }

    if($('#password').val() === "") {
        alert("Enter a password");
        return false;
    }

    return true;
}

function signIn() {
    if(!validateForm()) return;

    $('#loginForm').ajaxSubmit({

        error: function() {
            console.log("Error adding new node");
        },

        success: function(response) {
            //Show login validation
            var msg = response.msg;
            //DEBUG
            console.log("Response = ", msg);

            if(msg === "No such user") {
                $('#noSuchUser').show();
            } else {
                window.location.href = "/showGraphs";
            }
        }
    });
}

$(document).ready(function() {

    $('#signIn').on("click", function() {
        $('#noSuchUser').hide();
        signIn();
    });

    $('#createAccount').on("click", function() {
        window.location.href = "/createAccount";
    });

});
