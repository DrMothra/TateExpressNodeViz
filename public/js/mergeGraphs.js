/**
 * Created by DrTone on 30/03/2017.
 */

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

function onGraphsFound(response) {
    //Show all graphs to select from
    let elem = $('#graphList');

    let numGraphs = response.msg.length;
    let graphData = response.msg, graphInfo;
    let i;
    for(i=0; i<numGraphs; ++i) {
        graphInfo = graphData[i];
        elem.append("<div class='row'>" +
            "<div class='col-md-3'>" + graphInfo.name + "</div>" +
            "<div class='col-md-1 checkbox'><input type='checkbox'></div>" +
            "</div>");
    }
}

function getGraphs() {
    //Get all graphs in account
    let searchInfo = {
        query: "TateCartographyProject"
    };
    let graphData = {method: "POST",
        data: searchInfo,
        url: '/processSearchCommons',
        dataType: 'JSON'};

    sendData(graphData, onGraphsFound);
}



$(document).ready( ()=> {
    //Fill in url query params
    let params = new URLSearchParams(window.location.search);
    let graphName = params.get('name');

    //Ensure we have graph
    if(!graphName) {
        alert("Select a graph to modify from the Home page!");
        window.location.href = "/showGraphs";
        return;
    }

    $('#graphName').html(graphName);

    //Get graphs to merge
    getGraphs();

});

