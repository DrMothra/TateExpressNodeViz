/**
 * Created by atg on 01/02/2017.
 */

let graphNodeNames, graphNodeTypes;

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
    let graphID = $('#graphID').val();
    let nodeData = {
        graphID: graphID
    };

    let graphData = {
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
    let graphID = $('#graphID').val();
    let linkData = {
        graphID: graphID
    };

    let graphData = {
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

    let nodeName = $('#addNodeName').val();
    if(nodeName === "") {
        alert("Enter a node name");
        return false;
    }

    let nodeType = $('#addNodeType').val();
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
    //Add author info
    $('#author').val(localStorage.getItem("TateUsername"));
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
    let graphID = $('#graphID').val();
    let name = $('#graphName').html();
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
