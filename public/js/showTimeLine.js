/**
 * Created by atg on 24/03/2017.
 */

function onEditData(editData) {
    //Populate table of edits
    let edits = editData.msg;
    let numEdits = edits.length;

    if(numEdits === 0) {
        $('#mapName').html($('#mapName').val() + " There are no edits for this graph");
        return;
    }
    let attributes = ["author", "time", "type", "fromNodeID", "toNodeID", "linkNodeID", "weight"];
    let numAttributes = attributes.length;
    let table = document.getElementById("editsTable"), row, currentEdit, i, j;
    for(i=0; i<numEdits; ++i) {
        row = table.insertRow(i+1);
        currentEdit = edits[i];
        for(j=0; j<numAttributes; ++j) {
            row.insertCell(-1).innerHTML = currentEdit[attributes[j]];
        }
        row.insertCell(-1).innerHTML = "<button type='button' class='btn btn-primary'>Create View</button>";
    }
}

$(document).ready(()=> {
    //Fill in url query params
    let params = new URLSearchParams(window.location.search);
    let mapID = params.get('mapID');
    let mapName = params.get('name');

    //Ensure we have graph
    if(!mapName) {
        alert("Select a graph timeline from the Home page!");
        window.location.href = "/showMyView?authorName=" + localStorage.getItem("TateUsername");
        return;
    }

    let mapManager = new MapManager();
    mapManager.getEdits(mapID, onEditData);

    $('#myViews').on("click", ()=> {
        window.location.href = "/showMyViews?authorName=" + localStorage.getItem("TateUsername");
    });

    $('#mapName').html(mapName);

});
