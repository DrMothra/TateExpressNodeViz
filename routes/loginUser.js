/**
 * Created by DrTone on 14/02/2017.
 */

//Database
var dbase = require('../model/databaseManager');

//Handle login procedure
exports.login = function(req, res, next) {
    //DEBUG
    //console.log("Received login request");
    dbase.validateUser(req.body.userName, req.body.password, function(valid) {
        if(!valid) {
            console.log("User not found");
            res.send( {msg: "No such user"} );
        } else {
            console.log("User found");
            res.send( {msg: "User found"} );
        }
    })
};

exports.createAccount = function(req, res, next) {
    //DEBUG
    console.log("Created new account");

    res.render("created");
};
