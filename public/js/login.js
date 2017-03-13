/**
 * Created by DrTone on 14/02/2017.
 */

const tateUserNameText = "TateUsername";

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

    //DEBUG
    let userName = $('#userName').val();
    /*
    if($('#rememberMe').prop("checked")) {
        var userName = $('#userName').val();
        localStorage.setItem("TateUsername", userName);
    }
    */
    //Always store name for now
    localStorage.setItem(tateUserNameText, userName);

    $('#loginForm').ajaxSubmit({

        error: function() {
            console.log("Error adding new node");
        },

        success: function(response) {
            //Show login validation
            let msg = response.msg;
            LoginManager.loginUser();
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

    //See if we have logged in before
    LoginManager.setLoginCredentials();

    let userName = localStorage.getItem(tateUserNameText);
    //DEBUG
    //console.log("Username = ", userName);
    if(userName !== undefined) {
        $('#userName').val(userName);
    }

    $('#signIn').on("click", function() {
        $('#noSuchUser').hide();
        signIn();
    });

    $('#createAccount').on("click", function() {
        window.location.href = "/createAccount";
    });

});
