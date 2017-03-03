/**
 * Created by DrTone on 02/02/2017.
 */

var graphNodeNames;

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

function onLinkUpdated(response) {
    var link = parseInt(response.msg, 10);
    if(isNaN(link)) {
        console.log("Index invalid");
        return;
    }

    var elem = $('#'+link+'updated');
    elem.show();
    setTimeout(function() {
        elem.hide();
    }, 3000);
}

function updateLinkInfo(linkID, choice) {
    //Strip out id
    var id = linkID.charAt(0);
    var linkData = {
        link: id,
        choice: choice
    };
    var graphData = {
        method: "POST",
        data: linkData,
        url: '/processLinks',
        dataType: 'JSON'
    };
    sendData(graphData, onLinkUpdated);
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
        $('#node_Name').typeahead( {source: graphNodeNames} );
    });
}

function onBack() {
    var graphID = $('#graphID').val();
    var name = $('#graphName').html();
    window.location.href = "/modifyGraph?graphID="+graphID+"&name="+name;
}

function validateForm() {
    if($('#graphID').val() === "") {
        alert("Enter a graph ID");
        return false;
    }

    var nodeName = $('#node_Name').val();
    if(nodeName === "") {
        alert("Enter a node name");
        return false;
    }
    if(graphNodeData.indexOf(nodeName) < 0) {
        alert("Node not in graph!");
        return false;
    }

    return true;
}

$(document).ready(function() {

    //Autocomplete
    getGraphNodeNames();

    var graphID = $('#graphID').val();
    $('.getGraphID').val(graphID);

    $('#searchForm').on("submit", function() {
        return validateForm();
    });

    $("[id*='yesLink']").on("click", function() {
        updateLinkInfo(this.id, 1);
    });

    $("[id*='noLink']").on("click", function() {
        updateLinkInfo(this.id, 0);
    });

    $("#backToModify").on("click", function () {
        onBack();
    })
});
