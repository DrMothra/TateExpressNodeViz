/**
 * Created by atg on 07/04/2017.
 */

//Handles all map related transactions

class MapManager {
    constructor() {
        this.mapList = [];
        this.authors = [];
        this.currentAuthor = localStorage.getItem("TateUsername");
        this.socketConnected = false;
        this.updateMessages = [];
        this.subTitle = "T8te";
    }

    getMaps(onFound) {
        //Get all maps in account
        let searchInfo = {
            query: this.subTitle
        };
        let graphData = {method: "POST",
            data: searchInfo,
            url: '/processSearchCommons',
            dataType: 'JSON'};

        this.getMapData(graphData, onFound);
    }

    createView(mapInfo) {

    }

    addMap(mapInfo) {
        this.mapList.push(mapInfo);
    }

    getMapInfo(index) {
        return this.mapList[index];
    }

    updateLinkInfo(id, name, choice, callback) {
        let index = id.match(/\d/g);
        index = index.join("");
        if(isNaN(index)) {
            alert("Invalid map selected!");
            return;
        }

        let linkData = {
            link: index,
            choice: choice,
            name: name,
            author: this.currentAuthor
        };

        let mapData = {
            method: "POST",
            data: linkData,
            url: '/processLinks',
            dataType: 'JSON'
        };

        this.getMapData(mapData, callback);
    }

    deleteNode(nodeInfo, callback) {
        let nodeData = {
            mapID: nodeInfo.mapID,
            nodeID: nodeInfo.id,
            name: nodeInfo.name,
            author: localStorage.getItem("TateUsername")
        };

        let mapData = {
            method: 'post',
            data: nodeData,
            url: '/processDeleteNode',
            dataType: 'JSON'
        };

        this.getMapData(mapData, callback);
    }

    getGraphNodeNames(mapID, callback) {
        if(!mapID) {
            console.log("No map id supplied!");
            return;
        }

        let nodeData = {
            mapID: mapID
        };

        let mapData = {
            method: 'post',
            data: nodeData,
            url: '/processGetNodeNames',
            dataType: 'JSON'
        };

        this.getMapData(mapData, callback);
    }

    getGraphNodeTypes(mapID, callback) {
        if(!mapID) {
            console.log("No map id supplied!");
            return;
        }

        let nodeData = {
            mapID: mapID
        };

        let mapData = {
            method: 'post',
            data: nodeData,
            url: '/processGetNodeTypes',
            dataType: 'JSON'
        };

        this.getMapData(mapData, callback);
    }

    getGraphLinkTypes(mapID, callback) {
        if(!mapID) {
            console.log("No map id supplied!");
            return;
        }

        let nodeData = {
            mapID: mapID
        };

        let mapData = {
            method: 'post',
            data: nodeData,
            url: '/processGetLinkTypes',
            dataType: 'JSON'
        };

        this.getMapData(mapData, callback);
    }

    getEdits(mapID, callback) {
        if(!mapID) {
            console.log("No map id!");
            return;
        }

        let mapInfo = {
            mapID: mapID
        };

        let mapData = {
            method: "POST",
            data: mapInfo,
            url: '/processGetMapEdits',
            dataType: 'JSON'
        };

        this.getMapData(mapData, callback);
    }

    sendUpdates(msg, callback) {
        if(!this.socketConnected) {
            this.socket = io.connect();
            this.socketConnected = true;
        }
        this.updateMessages.push(msg);
        this.socket.on(msg, data=> {
            if(callback) {
                callback(data.msg);
            } else {
                console.log("Received", msg);
            }
        });
    }

    getMapData(data, callback) {
        $.ajax({
            type: data.method,
            data: data.data,
            url: data.url,
            dataType: data.dataType
        }).done(function(response) {
            //DEBUG
            console.log("Data sent");
            if(callback !== undefined) {
                callback(response);
            }
        })
    }
}