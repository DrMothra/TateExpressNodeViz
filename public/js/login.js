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

$(document).ready(function() {

    $('#loginForm').on("submit", function() {
        return validateForm();
    });

    $('#createAccount').on("click", function() {
        window.location.href = "/createAccount";
    });

});
