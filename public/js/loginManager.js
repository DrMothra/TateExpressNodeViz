/**
 * Created by atg on 13/03/2017.
 */

//Handle user logins

var LoginManager = (function() {
    var userLoginText = 'userLoggedIn';

    return {
        setLoginCredentials: function() {
            sessionStorage.setItem(userLoginText, "false");
        },

        loginUser: function() {
            sessionStorage.setItem(userLoginText, "true");
        },

        userLoggedIn: function() {
            return sessionStorage.getItem(userLoginText) === "true";
        }
    }
})();
