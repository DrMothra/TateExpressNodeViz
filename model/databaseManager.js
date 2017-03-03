/**
 * Created by atg on 03/03/2017.
 */

//All database handling
var Client = require('mariasql');

var c = new Client({
    host: 'mysql.cs.nott.ac.uk',
    user: 'psztg1_Tate',
    password: 'VHRHFA',
    db: 'psztg1_TateViz'
});

c.on('connect', function() {
    console.log("Client connected");
})
    .on('error', function(err) {
        console.log("Client error: " + err);
    });

//Test query
exports.c.query('show tables', function(err, rows) {
    if (err)
        throw err;
    console.dir(rows);
});

