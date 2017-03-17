/**
 * Created by DrTone on 14/02/2017.
 */
"use strict";
//Database
let dbase = require('../model/databaseManager');

//Home page
exports.home = function(req, res, next) {
    //DEBUG
    //console.log("Home");
    res.render("home");
};

//Handle login procedure
exports.validateLogin = function(req, res, next) {
    dbase.validateUser(req.body.userName, req.body.password, function(valid) {
        if(!valid) {
            console.log("User not found");
            res.send( {msg: "No such user"} );
        } else {
            console.log("User found");
            res.send( {msg: "User found"} );
        }
    });
};

exports.validateNewAccount = function(req, res, next) {
    //See if user already exists
    dbase.checkForUser(req.body.fullName, req.body.username, function(exists) {
        if(exists) {
            console.log("User already exists");
            res.send( {msg: "User already exists"} );
        } else {
            console.log("Valid user");
            res.send( {msg: "Valid new user"} );
            dbase.addUser(req.body.fullName, req.body.username);
        }
    });
};

exports.createAccount = function(req, res, next) {
    res.render('createAccount');
};
