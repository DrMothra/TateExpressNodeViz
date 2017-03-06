/**
 * Created by atg on 03/03/2017.
 */

//All database handling
var Client = require('mariasql');

var c = new Client({
    host: 'mysql.cs.nott.ac.uk',
    user: 'psztg1_TateViz',
    password: 'VHRHFA',
    db: 'psztg1_TateViz'
});
console.log("Client connected");

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

