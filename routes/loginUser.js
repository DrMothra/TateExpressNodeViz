/**
 * Created by DrTone on 14/02/2017.
 */

//Handle login procedure
exports.login = function(req, res, next) {
    //DEBUG
    //console.log("Received login request");

    res.render("addGraph");
};

exports.createAccount = function(req, res, next) {
    //DEBUG
    console.log("Created new account");

    res.render("created");
};
