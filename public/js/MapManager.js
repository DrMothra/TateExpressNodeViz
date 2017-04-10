/**
 * Created by atg on 07/04/2017.
 */

//Handles all map related transactions

class MapManager {
    constructor() {
        this.mapList = [];
        this.authors = [];
        this.currentAuthor = localStorage.getItem("TateUsername");
    }

    getMaps(onFound) {
        //Get all maps in account
        let searchInfo = {
            query: "TateCartographyProject"
        };
        let graphData = {method: "POST",
            data: searchInfo,
            url: '/processSearchCommons',
            dataType: 'JSON'};

        this.getMapData(graphData, onFound);
    }

    addMap(mapInfo) {
        this.mapList.push(mapInfo);
    }

    getMapInfo(index) {
        return this.mapList[index];
    }

    updateLinkInfo(index, name, choice, callback) {
        index = index.slice(-1);
        if(isNaN(index)) {
            console.log("Invalid link index!");
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