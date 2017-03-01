/**
 * Created by DrTone on 02/02/2017.
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
        $('#fromNodeName').typeahead( {source: graphNodeData} );
        $('#toNodeName').typeahead( {source: graphNodeData} );
    });
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
        graphTypeData = response.msg;
        $('#fromNodeType').typeahead( {source: graphTypeData} );
        $('#toNodeType').typeahead( {source: graphTypeData} );
        $('#linkType').typeahead( {source: graphTypeData} );
    })
}

function validateForm() {
    if($("#graphID").val() === "") {
        alert("Enter a graph ID");
        return false;
    }

    var fromName = $('#fromNodeName').val();
    if(fromName === "") {
        alert("Enter a node name");
        return false;
    }
    if(graphNodeData.indexOf(fromName) < 0) {
        alert("From node not in graph!");
        return false;
    }

    var fromType = $('#fromNodeType').val();
    if(fromType === "") {
        alert("Enter a valid from type");
        return false;
    }
    if(graphTypeData.indexOf(fromType) < 0) {
        alert("Enter a valid type");
        return false;
    }

    var toName = $('#toNodeName').val();
    if(toName === "") {
        alert("Enter a node name");
        return false;
    }
    if(graphNodeData.indexOf(toName) < 0) {
        alert("To node not in graph!");
        return false;
    }

    var toType = $('#toNodeType').val();
    if(toType === "") {
        alert("Enter a node type");
        return false;
    }
    if(graphTypeData.indexOf(toType) < 0) {
        alert("Enter a valid to type");
        return false;
    }

    var newType = $('#linkType').val();
    if(newType === "") {
        alert("Enter a link type");
        return false;
    }

    return true;
}

function addNewLink() {
    //Send new node info
    $('#addLinkForm').ajaxSubmit({

        error: function() {
            console.log("Error adding new node");
        },

        success: function(response) {
            console.log("Received ", response);
            $('#addStatus').html("Link added");
        }
    });
}

$(document).ready(function() {

    //Autocomplete
    getGraphNodes();
    getGraphTypes();

    $('#addNewLink').on("click", function() {
        if(!validateForm()) return;
        addNewLink();
    });
});

