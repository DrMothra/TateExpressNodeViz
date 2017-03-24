/**
 * Created by atg on 24/03/2017.
 */

let graphID, graphName;

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

function getGraphEdits() {
    //Get edits to this graph
    let graphInfo = {
        graphID: graphID
    };

    let graphData = {
        method: "POST",
        data: graphInfo,
        url: '/processGetGraphEdits',
        dataType: 'JSON'
    };

    sendData(graphData, response => {
        //DEBUG
        console.log("Edits received");
        //Populate table of edits

    });
}


$(document).ready(()=> {
    //Fill in url query params
    let params = new URLSearchParams(window.location.search);
    graphID = params.get('graphID');
    graphName = params.get('name');

    //Ensure we have graph
    if(!graphName) {
        alert("Select a graph timeline from the Home page!");
        window.location.href = "/showGraphs";
        return;
    }

    $('#graphName').html(graphName);

    getGraphEdits();
});
