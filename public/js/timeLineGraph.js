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
        console.log("Edits received", response);
        //Populate table of edits
        let edits = response.msg;
        let numEdits = edits.length;
        //DEBUG
        console.log("Num edits =", numEdits);

        if(numEdits === 0) {
            $('#graphErrorStatus').html(" There are no edits for this graph");
            return;
        }
        let attributes = ["author", "time", "type"];
        let numAttributes = attributes.length;
        let table = document.getElementById("editsTable"), row, key, editData, i, j;
        for(i=0; i<numEdits; ++i) {
            row = table.insertRow(i+1);
            editData = edits[i];
            for(j=0; j<numAttributes; ++j) {
                row.insertCell(-1).innerHTML = editData[attributes[j]];
            }
        }
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
