/**
 * Created by DrTone on 02/02/2017.
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

function validateForm() {
    if($("#graphID").val() === "") {
        alert("Enter a graph ID");
        return false;
    }
    if($('#fromNodeName').val() === "") {
        alert("Enter a node name");
        return false;
    }
    if($('#fromNodeType').val() === "") {
        alert("Enter a node type");
        return false;
    }
    if($('#toNodeName').val() === "") {
        alert("Enter a node name");
        return false;
    }
    if($('#toNodeType').val() === "") {
        alert("Enter a node type");
        return false;
    }
    if($('#linkType').val() === "") {
        alert("Enter a link type");
        return false;
    }

    return true;
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
        $('#fromNodeName').typeahead( {source: nodesData} );
        $('#toNodeName').typeahead( {source: nodesData} );
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
        var typeData = response.msg;
        $('#fromNodeType').typeahead( {source: typeData} );
        $('#toNodeType').typeahead( {source: typeData} );
        $('#linkType').typeahead( {source: typeData} );
    })
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

