/**
 * Created by DrTone on 01/03/2017.
 */

var graphNodeNames, graphLinkTypes;

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
    if(graphNodeNames.indexOf(fromName) < 0) {
        alert("From node not in graph!");
        return false;
    }

    var toName = $('#node_ToName').val();
    if(toName === "") {
        alert("Enter to node name");
        return false;
    }
    if(graphNodeNames.indexOf(toName) < 0) {
        alert("To node not in graph!");
        return false;
    }

    var linkName = $('#linkName').val();
    if(linkName === "") {
        alert("Enter a link name");
        return false;
    }
    if(graphLinkTypes.indexOf(linkName) < 0) {
        alert("Link not in graph!");
        return false;
    }

    return true;
}

function getGraphLinkTypes() {
    //Populate list of types
    var graphID = $('#graphID').val();
    var linkData = {
        graphID: graphID
    };

    var graphData = {
        method: 'post',
        data: linkData,
        url: '/getLinkTypes',
        dataType: 'JSON'
    };

    sendData(graphData, function(response) {
        graphLinkTypes = response.msg;
        $('#linkName').typeahead( {source: graphLinkTypes} );
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
        url: '/getNodeNames',
        dataType: 'JSON'
    };

    sendData(graphData, function(response) {
        graphNodeNames = response.msg;
        $('#node_FromName').typeahead( {source: graphNodeNames} );
        $('#node_ToName').typeahead( {source: graphNodeNames} );
    });
}

function deleteLink() {

}

function onBack() {
    var graphID = $('#graphID').val();
    var name = $('#graphName').html();
    window.location.href = "/modifyGraph?graphID="+graphID+"&name="+name;
}

$(document).ready(function() {
    //Autocomplete
    getGraphNodeNames();
    getGraphLinkTypes();

    $('#linkDelete').on("click", function() {
        if(!validateForm()) return;
        deleteLink();
    });

    $("#backToModify").on("click", function () {
        onBack();
    });
});
