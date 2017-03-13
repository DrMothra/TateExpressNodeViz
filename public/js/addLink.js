/**
 * Created by DrTone on 02/02/2017.
 */

var graphNodeNames, graphNodeTypes, graphLinkTypes;

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

function getGraphNodeNames() {
    //Populate list of nodes
    var graphID = $('#graphID').val();
    var nodeData = {
        graphID: graphID
    };

    var graphData = {
        method: 'post',
        data: nodeData,
        url: '/processGetNodeNames',
        dataType: 'JSON'
    };

    sendData(graphData, function(response) {
        graphNodeNames = response.msg;
        $('#fromNodeName').typeahead( {source: graphNodeNames} );
        $('#toNodeName').typeahead( {source: graphNodeNames} );
    });
}

function getGraphNodeTypes() {
    //Populate list of types
    var graphID = $('#graphID').val();
    var linkData = {
        graphID: graphID
    };

    var graphData = {
        method: 'post',
        data: linkData,
        url: '/processGetNodeTypes',
        dataType: 'JSON'
    };

    sendData(graphData, function(response) {
        graphNodeTypes = response.msg;
        $('#fromNodeType').typeahead( {source: graphNodeTypes} );
        $('#toNodeType').typeahead( {source: graphNodeTypes} );
    })
}

function getGraphLinkTypes() {
    var graphID = $('#graphID').val();
    var linkData = {
        graphID: graphID
    };

    var graphData = {
        method: 'post',
        data: linkData,
        url: '/processGetLinkTypes',
        dataType: 'JSON'
    };

    sendData(graphData, function(response) {
        graphLinkTypes = response.msg;
        $('#linkType').typeahead( {source: graphLinkTypes} );
    })
}

function validateForm() {
    if($("#graphID").val() === "") {
        alert("Enter a graph ID");
        return false;
    }

    var fromName = $('#fromNodeName').val();
    if(fromName === "") {
        alert("Enter a from node name");
        return false;
    }
    if(graphNodeNames.indexOf(fromName) < 0) {
        alert("From node not in graph!");
        return false;
    }

    var fromType = $('#fromNodeType').val();
    if(fromType === "") {
        alert("Enter a valid from type");
        return false;
    }
    if(graphNodeTypes.indexOf(fromType) < 0) {
        alert("Enter a valid from type");
        return false;
    }

    var toName = $('#toNodeName').val();
    if(toName === "") {
        alert("Enter a to node name");
        return false;
    }
    if(graphNodeNames.indexOf(toName) < 0) {
        alert("To node not in graph!");
        return false;
    }

    var toType = $('#toNodeType').val();
    if(toType === "") {
        alert("Enter a node to type");
        return false;
    }
    if(graphNodeTypes.indexOf(toType) < 0) {
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

function onBack() {
    var graphID = $('#graphID').val();
    var name = $('#graphName').html();
    window.location.href = "/modifyGraph?graphID="+graphID+"&name="+name;
}

$(document).ready(function() {

    //Autocomplete
    getGraphNodeNames();
    getGraphNodeTypes();
    getGraphLinkTypes();

    $('#addNewLink').on("click", function() {
        if(!validateForm()) return;
        addNewLink();
    });

    $("#backToModify").on("click", function () {
        onBack();
    });
});

