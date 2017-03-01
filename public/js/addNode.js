/**
 * Created by atg on 01/02/2017.
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
        $('#addNodeName').typeahead( {source: nodesData} );
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
        $('#addNodeType').typeahead( {source: typeData} );
    })
}

function validateForm() {
    if($("#graphID").val() === "") {
        alert("Enter a graph ID");
        return false;
    }
    if($('#addNodeName').val() === "") {
        alert("Enter a node name");
        return false;
    }
    if($('#addNodeType').val() === "" && $('#addNewType').val() === "") {
        alert("Enter a node type");
        return false;
    }

    return true;
}

function addNewNode() {
    //Send new node info
    $('#addNodeForm').ajaxSubmit({

        error: function() {
            console.log("Error adding new node");
        },

        success: function(response) {
            console.log("Received ", response);
            $('#addStatus').html("Node added");
        }
    });
}

$(document).ready(function() {

    //Autocomplete actions
    getGraphTypes();

    $('#addNewNode').on("click", function() {
        if(!validateForm()) return;
        addNewNode();
    });
});
