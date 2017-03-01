/**
 * Created by atg on 01/02/2017.
 */

var nodeData, typeData;

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
        nodeData = response.msg;
        $('#addNodeName').typeahead( {source: nodeData} );
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
        typeData = response.msg;
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

    var nodeType = $('#addNodeType').val();
    if(nodeType === "") {
        alert("Enter a node type");
        return false;
    }

    if(typeData.indexOf(nodeType) < 0) {
        alert("Enter a valid type");
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
