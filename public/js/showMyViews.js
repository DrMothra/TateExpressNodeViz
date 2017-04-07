/**
 * Created by DrTone on 05/04/2017.
 */

let author;

function sendData(data, callback) {
    $.ajax({
        type: data.method,
        data: data.data,
        url: data.url,
        dataType: data.dataType
    }).done((response)=> {
        //DEBUG
        console.log("Data sent");
        if(callback !== undefined) {
            callback(response);
        }
    })
}

function onMapsFound(response) {
    //List all maps via user
    let numMaps = response.msg.length;
    if(numMaps === 0) {
        $('#mapStatus').html("no perspectives");
        return;
    }

    let i, mapInfo, currentAuthor, mapElem = $('#mapList'), mapLink;
    for(i=0; i<numMaps; ++i) {
        mapInfo = response.msg[i];
        mapLink = "<a href='https://graphcommons.com/graphs/" + mapInfo.graphID + "' target='_blank'>";
        currentAuthor = mapInfo.author;
        if(currentAuthor === author) {
            mapElem.append("<div class='row graphInfo'>" +
                "<div class='col-md-3'>" + mapLink + mapInfo.name + "</a></div>" +
                "<div class='col-md-2'> <button type='button' class='btn btn-primary modifyView' data-toggle='tooltip' data-placement='top' title='Modify this map'>Modify View</button>" +
                "<button type='button' class='btn btn-primary timeLine' data-toggle='tooltip' data-placement='top' title='Show map timeline'>Timeline</button></div>" +
                "</div>");
        }
    }
}

function getMaps() {
    //Get all graphs in account
    let searchInfo = {
        query: "TateCartographyProject"
    };
    let mapData = {method: "POST",
        data: searchInfo,
        url: '/processSearchCommons',
        dataType: 'JSON'};

    sendData(mapData, onMapsFound);
}

$(document).ready(()=> {
    //Get params from URL
    let params = new URLSearchParams(window.location.search);
    author = params.get('authorName');

    //Ensure we have graph
    if(!author) {
        alert("No author name in URL!");
        return;
    }

    $('#authorName').html(author);

    getMaps();
});
