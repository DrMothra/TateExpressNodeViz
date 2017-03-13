/**
 * Created by atg on 01/02/2017.
 */

var graphNodeNames, graphNodeTypes;

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
        $('#addNodeName').typeahead( {source: graphNodeNames} );
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
        $('#addNodeType').typeahead( {source: graphNodeTypes} );
    })
}

function validateForm() {
    if($("#graphID").val() === "") {
        alert("Enter a graph ID");
        return false;
    }

    var nodeName = $('#addNodeName').val();
    if(nodeName === "") {
        alert("Enter a node name");
        return false;
    }

    var nodeType = $('#addNodeType').val();
    if(nodeType === "") {
        alert("Enter a node type");
        return false;
    }
    if(graphNodeTypes.indexOf(nodeType) < 0) {
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

function onBack() {
    var graphID = $('#graphID').val();
    var name = $('#graphName').html();
    window.location.href = "/modifyGraph?graphID="+graphID+"&name="+name;
}

$(document).ready(function() {
    //Autocomplete actions
    //getGraphNodeNames();
    getGraphNodeTypes();

    $('#addNewNode').on("click", function() {
        if(!validateForm()) return;
        addNewNode();
    });

    $("#backToModify").on("click", function () {
        onBack();
    });
});
