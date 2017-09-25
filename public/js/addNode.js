/**
 * Created by atg on 01/02/2017.
 */

let mapNodeTypes, mapNodeNames;
let contentAdded = 0;
const MAX_ADDED = 5;
let submitted = false;

function onGetNodeTypes(response) {
    //Populate list of types
    mapNodeTypes = response.msg;
    $('#addNodeType0').typeahead( {source: mapNodeTypes} );
}

function validateForm() {
    if($("#mapID").val() === "") {
        alert("Enter a map ID");
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

    return true;
}

function addNewNode() {
    //Send new node info
    //Add author info
    $('#author').val(localStorage.getItem("TateUsername"));

    waitForResponses();
    if(submitted) {
        console.log("Already submitted!");
        return;
    }
    submitted = true;
    $('#addNodeForm').ajaxSubmit({
        error: function() {
            submitted = false;
            console.log("Error adding new node");
        },

        success: function(response) {
            submitted = false;
            console.log("Received ", response);
            let i, status, waiting, numResponses = response.msg.length;
            for(i=0; i<numResponses; ++i) {
                status = $('#addStatus' + i);
                status.show();
                waiting = $('#waitStatus' + i);
                waiting.hide();
                status.html(response.msg[i].msg);
            }
        }
    });
}

function waitForResponses() {
    let content = "addNodeName";
    let status = "waitStatus";
    for(let i=0; i<MAX_ADDED; ++i) {
        if($('#' + content + i).val()) {
            $('#'+ status + i).show();
        }
    }
}

function addContent() {
    //Add more input fields
    if(++contentAdded >= MAX_ADDED) return;

    $('#addNodeForm').append("<div class='form-group'>" +
            "<label class='col-md-1 control-label'>Content</label>" +
            "<div class='col-md-5'>" +
                "<input type='text' class='form-control modifyContent'>" +
            "</div>" +
            "<div class='col-md-1 contentFeedback'>" +
                "<span class='label label-success modifyFeedback'></span>" +
                "<span class='label label-warning modifyWaiting noDisplay'>Waiting...</span> " +
            "</div>" +
        "</div>" +
        "<div class='form-group'>" +
        "<label for='addNodeType' class='col-md-1 control-label'>Content Type</label>" +
        "<div class='col-md-5'>" +
            "<input type='text' class='form-control modifyType'>" +
        "</div>" +
        "</div>");

    //Assign id's and names
    $('.modifyContent').attr("id", index => {
        ++index;
        return "addNodeName" + index;
    });

    $('.modifyContent').attr("name", index => {
        ++index;
        return "addNodeName" + index;
    });

    $('.modifyType').attr("id", function(index) {
        ++index;
        $(this).typeahead( {source: mapNodeTypes} );
        return "addNodeType" + index;
    });

    $('.modifyType').attr("name", index => {
        ++index;
        return "addNodeType" + index;
    });

    $('.modifyFeedback').attr("id", index => {
        ++index;
        return "addStatus" + index;
    });

    $('.modifyWaiting').attr("id", index => {
        ++index;
        return "waitStatus" + index;
    });
}

function onBack() {
    let mapID = $('#mapID').val();
    let name = $('#mapName').html();
    window.location.href = "/modifyMap?mapID="+mapID+"&name="+name;
}

$(document).ready(function() {
    let mapManager = new MapManager();
    let mapID = $('#mapID').val();
    mapManager.getGraphNodeTypes(mapID, onGetNodeTypes);
    mapManager.getGraphNodeNames(mapID, response => {
        mapNodeNames = response.msg;
    });

    $('#addNewNode').on("click", function() {
        if(!validateForm()) return;
        $('#addStatus0').hide();
        $('#waitStatus0').hide();
        addNewNode();
    });

    $('#addContent').on("click", () => {
        addContent();
    });

    $("#backToModify").on("click", () => {
        onBack();
    });

    let author;
    $('#backToViews').on("click", () => {
        author = localStorage.getItem("CurrentAuthor");
        window.location.href = "/showViews?authorName="+author;
    });
});
