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
    let time = new Date().toUTCString();
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

exports.loginUser = function(userName) {
    let time = new Date().toUTCString();
    c.query('insert into edits (author, time, type) values (:author, :time, "LoggedIn")',
        { author: userName, time: time },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });
};

exports.copyGraph = editInfo => {
    let time = new Date().toUTCString();
    c.query('insert into edits (author, time, graphID, type, fromNodeID) values (:author, :time, :graphID, "CopyGraph", :nodeID)',
        { author: editInfo.userName, time: time, graphID: editInfo.graphID, nodeID: editInfo.fromNodeID },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });
};

exports.deleteGraph = editInfo => {
    let time = new Date().toUTCString();
    c.query('insert into edits (author, time, graphID, type) values (:author, :time, :graphID, "DeleteGraph")',
        { author: editInfo.userName, time: time, graphID: editInfo.graphID },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });
};

exports.addNode = editInfo => {
    //Get database values
    let time = new Date().toUTCString();
    c.query('insert into edits (author, time, graphID, type, fromNodeName, fromNodeID) values (:author, :time, :graphID, "AddNode", :nodeName, :nodeID)',
        { author: editInfo.author, time: time, graphID: editInfo.mapID, nodeName: editInfo.addNodeName, nodeID: editInfo.nodeID },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.deleteNode = editInfo => {
    //Get database values
    let time = new Date().toUTCString();
    c.query('insert into edits (author, time, graphID, type, fromNodeName, fromNodeID) values (:author, :time, :graphID, "DeleteNode", :nodeName, :nodeID)',
        { author: editInfo.author, time: time, graphID: editInfo.mapID, nodeName: editInfo.name, nodeID: editInfo.nodeID },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.addLink = editInfo => {
    //Get database values
    let time = new Date().toUTCString();
    c.query('insert into edits (author, time, graphID, type, fromNodeID, fromNodeName, toNodeID, toNodeName, linkNodeID, linkNodeName) values (:author, :time, :graphID, "AddLink", :fromNodeID, :fromNodeName, :toNodeID, :toNodeName, :linkNodeID, :linkNodeName)',
        { author: editInfo.author, time: time, graphID: editInfo.mapID, fromNodeID: editInfo.fromNodeID, fromNodeName: editInfo.fromName, toNodeID: editInfo.toNodeID, toNodeName: editInfo.toName, linkNodeID: editInfo.linkNodeID, linkNodeName: editInfo.linkType },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.updateNode = editInfo => {
    //Get database values
    let time = new Date().toUTCString();
    c.query('insert into edits (author, time, graphID, type, fromNodeName, fromNodeID, toNodeName, toNodeID, linkNodeName, linkNodeID, weight) values (:author, :time, :graphID, "UpdateNode", :fromNodeName, :fromNodeID, :toNodeName, :toNodeID, :linkNodeName, :linkNodeID, :weight)',
        { author: editInfo.author, time: time, graphID: editInfo.mapID, fromNodeName: editInfo.name, fromNodeID: editInfo.fromNodeID, toNodeName: editInfo.toNodeName, toNodeID: editInfo.toNodeID, linkNodeName: editInfo.linkNodeName, linkNodeID: editInfo.linkNodeID, weight: editInfo.weight },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.deleteLink = editInfo => {
    //Get database values
    let time = new Date().toUTCString();
    c.query('insert into edits (author, time, graphID, type, fromNodeID, fromNodeName, toNodeID, toNodeName, linkNodeID, linkNodeName) values (:author, :time, :graphID, "DeleteLink", :fromNodeID, :fromNodeName, :toNodeID, :toNodeName, :linkNodeID, :linkNodeName)',
        { author: editInfo.author, time: time, graphID: editInfo.mapID, fromNodeID: editInfo.fromNodeID, fromNodeName: editInfo.node_FromName, toNodeID: editInfo.toNodeID, toNodeName: editInfo.node_ToName, linkNodeID: editInfo.linkNodeID, linkNodeName: editInfo.linkName },
        function(err, rows) {
            if(err) {
                throw err;
            }
        });

    c.end();
};

exports.createGraph = editInfo => {
    let time = new Date().toUTCString();
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
    let time = new Date().toUTCString();
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
        { graphID: graphInfo.mapID },
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