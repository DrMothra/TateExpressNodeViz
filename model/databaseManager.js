/**
 * Created by atg on 03/03/2017.
 */
"use strict";
//All database handling
let Client = require('mariasql');

//Get correct database
let dbase = process.env.DATABASE_ENV || 'UNI';

let c;
if(dbase === 'UNI') {
    c = new Client({
        host: 'mysql.cs.nott.ac.uk',
        user: 'psztg1_TateViz',
        password: 'VHRHFA',
        db: 'psztg1_TateViz'
    });
} else {
    c = new Client({
        host: 'localhost',
        user: 'root',
        password: 'RAV4oct16',
        db: 'TateViz'
    });
}

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
        let i, numUsers = rows.length, valid = false;
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
        let exists = false;
        let i, numRows = rows.length;
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

    c.end();
};

exports.addNode = editInfo => {
    //Get database values
    let time = Date.now();
    c.query('insert into edits (author, time, graphID, type, fromNodeID) values (:author, :time, :graphID, "AddNode", :nodeID)',
        { author: editInfo.author, time: time, graphID: editInfo.graphID, nodeID: editInfo.addNodeName },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.deleteNode = editInfo => {
    //Get database values
    let time = Date.now();
    c.query('insert into edits (author, time, graphID, type, fromNodeID) values (:author, :time, :graphID, "DeleteNode", :nodeID)',
        { author: editInfo.author, time: time, graphID: editInfo.graphID, nodeID: editInfo.name },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.addLink = editInfo => {
    //Get database values
    let time = Date.now();
    c.query('insert into edits (author, time, graphID, type, fromNodeID, toNodeID, linkNodeID) values (:author, :time, :graphID, "AddLink", :fromNodeID, :toNodeID, :linkNodeID)',
        { author: editInfo.author, time: time, graphID: editInfo.graphID, fromNodeID: editInfo.fromName, toNodeID: editInfo.toName, linkNodeID: editInfo.linkType },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.updateNode = editInfo => {
    //Get database values
    let time = Date.now();
    c.query('insert into edits (author, time, graphID, type, fromNodeID, toNodeID, linkNodeID, weight) values (:author, :time, :graphID, "UpdateNode", :fromNodeID, :toNodeID, :linkNodeID, :weight)',
        { author: editInfo.author, time: time, graphID: editInfo.graphID, fromNodeID: editInfo.name, toNodeID: editInfo.toNodeID, linkNodeID: editInfo.linkNodeID, weight: editInfo.weight },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.deleteLink = editInfo => {
    //Get database values
    let time = Date.now();
    c.query('insert into edits (author, time, graphID, type, fromNodeID, toNodeID, linkNodeID) values (:author, :time, :graphID, "DeleteLink", :fromNodeID, :toNodeID, :linkNodeID)',
        { author: editInfo.author, time: time, graphID: editInfo.graphID, fromNodeID: editInfo.node_FromName, toNodeID: editInfo.node_ToName, linkNodeID: editInfo.linkName },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.createGraph = editInfo => {
    let time = Date.now();
    c.query('insert into edits (author, time, graphID, type) values (:author, :time, :graphID, "CreateGraph")',
        { author: editInfo.author, time: time, graphID: editInfo.graphID },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.newGraphID = editInfo => {
    let time = Date.now();
    c.query('insert into edits (author, time, graphID, type) values (:author, :time, :graphID, "NewGraphID")',
        { author: editInfo.author, time: time, graphID: editInfo.graphID },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.getGraphEdits = (graphInfo, callback) => {
    //Get data associated with this graph
    c.query('select * from edits where graphID = :graphID',
        { graphID: graphInfo.graphID },
        function(err, rows) {
            if(err) {
                throw err;
            }
            if(callback) {
                callback(rows);
            }
        });

    c.end();
};