/**
 * Created by atg on 03/03/2017.
 */

//All database handling
var Client = require('mariasql');

//Uni
/*
var c = new Client({
    host: 'mysql.cs.nott.ac.uk',
    user: 'psztg1_TateViz',
    password: 'VHRHFA',
    db: 'psztg1_TateViz'
});
*/

//Home

var c = new Client({
    host: 'localhost',
    user: 'root',
    password: 'RAV4oct16',
    db: 'TateViz'
});

c.on('connect', function() {
    console.log("Client connected");
})
    .on('error', function(err) {
        console.log("Client error: " + err);
    });

exports.validateUser = function(username, password, callback) {
    c.query('select Username from users', function(err, rows) {
        if(err) {
            throw err;
        }
        //Search for user
        var i, numUsers = rows.length, valid = false;
        for(i=0; i<numUsers; ++i) {
            if(rows[i].Username === username) {
                valid = true;
                break;
            }
        }
        if(callback) {
            callback(valid);
        }
    });

    c.end();
};

exports.checkForUser = function(fullName, userName, callback) {
    c.query('select Fullname, Username from users', function(err, rows) {
        if(err) {
            throw err;
        }
        //See if name already exists
        var exists = false;
        var i, numRows = rows.length;
        for(i=0; i<numRows; ++i) {
            if(rows[i].Fullname === fullName || rows[i].Username === userName) {
                exists = true;
                break;
            }
        }
        if(callback) {
            callback(exists);
        }
    });

    c.end();
};

exports.addUser = function(fullName, userName) {
    c.query('insert into users (Username, Password, Fullname) values (:userName,"xxx", :fullName)',
        { userName: userName, fullName: fullName},
        function(err, rows) {
            if(err) {
                throw err;
            }
            //DEBUG
            console.log("New user inserted");
        });
};
