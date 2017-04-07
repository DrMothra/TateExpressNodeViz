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