/**
 * Created by DrTone on 14/02/2017.
 */

function validateForm() {
    if($('#fullName').val() === "") {
        alert("Enter a name");
        return false;
    }

    if($('#username').val() === "") {
        alert("Enter a username");
        return false;
    }

    if($('#password1').val() === "") {
        alert("Enter a password");
        return false;
    }

    if($('#password2').val() === "") {
        alert("Re-enter your password");
        return false;
    }

    return true;
}

function createAccount() {
    if(!validateForm()) return;

    $('#newAccountForm').ajaxSubmit({

        error: function() {
            console.log("Error adding new node");
        },

        success: function(response) {
            //Show login validation
            let msg = response.msg;
            let displayelem = $('#accountStatus');
            displayelem.show();
            if(msg === "User already exists") {
                displayelem.html("User already exists, enter different name/username.");
            } else {
                displayelem.html("Account created! Press back to login to your account.")
            }
        }
    });
}

$(document).ready(function() {

    $('#accountCreate').on("click", function() {
        return createAccount();
    })
});
