/**
 * Created by DrTone on 01/03/2017.
 */

var graphNodeData, graphTypeData;

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

function validateForm() {
    if($("#graphID").val() === "") {
        alert("Enter a graph ID");
        return false;
    }

    var fromName = $('#node_FromName').val();
    if(fromName === "") {
        alert("Enter from node name");
        return false;
    }
    if(graphNodeData.indexOf(fromName) < 0) {
        alert("From node not in graph!");
        return false;
    }

    return true;
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
        graphNodeData = response.msg;
        $('#node_FromName').typeahead( {source: graphNodeData} );
        $('#node_ToName').typeahead( {source: graphNodeData} );
    });
}

function deleteLink() {

}

$(document).ready(function() {
    //Autocomplete
    getGraphNodes();
    getGraphTypes();

    $('#linkDelete').on("click", function() {
        if(!validateForm()) return;
        deleteLink();
    });
});
