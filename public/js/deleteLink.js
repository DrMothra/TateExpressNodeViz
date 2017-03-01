/**
 * Created by DrTone on 01/03/2017.
 */

function sendData(data, callback) {
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

function getGraphTypes() {
    //Populate list of types
    var graphID = $('#graphID').val();
    var linkData = {
        graphID: graphID
    };

    var graphData = {
        method: 'post',
        data: linkData,
        url: '/getTypes',
        dataType: 'JSON'
    };

    sendData(graphData, function(response) {
        var typeData = response.msg;
        $('#linkName').typeahead( {source: typeData} );
    })
}

function getGraphNodes() {
    //Populate list of nodes
    var graphID = $('#graphID').val();
    var nodeData = {
        graphID: graphID
    };

    var graphData = {
        method: 'post',
        data: nodeData,
        url: '/getNodes',
        dataType: 'JSON'
    };

    sendData(graphData, function(response) {
        var nodesData = response.msg;
        $('#node_FromName').typeahead( {source: nodesData} );
        $('#node_ToName').typeahead( {source: nodesData} );
    });
}

$(document).ready(function() {
    //Autocomplete
    getGraphNodes();
    getGraphTypes();

});
