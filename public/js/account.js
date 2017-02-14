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

$(document).ready(function() {

    $('#newAccountForm').on("submit", function() {
        return validateForm();
    })
});
