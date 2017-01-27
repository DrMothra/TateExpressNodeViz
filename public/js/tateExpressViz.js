/**
 * Created by DrTone on 15/12/2016.
 */

function createNewGraph() {
    //Generate new graph
    var id = {
        id: 6,
        status: "OK"
    };

    $.ajax({
        type: 'POST',
        data: id,
        url: '/createGraph',
        dataType: 'JSON'
    }).done(function(response) {
        //DEBUG
        console.log("Created new graph ID");
        $('#graphID').html(response.msg);
    })
}

function updateLinkInfo(linkID, choice) {
    //Strip out id
    var id = linkID.charAt(0);
    var linkData = {
        link: id,
        choice: choice
    };

    $.ajax({
        type: 'POST',
        data: linkData,
        url: '/processLinks',
        dataType: 'JSON'
    }).done(function(response) {
        if(response.msg === 'OK') {
            console.log("Weight updated");
            var elem = $('#'+id+'updated');
            elem.show();
            setTimeout(function() {
                elem.hide();
            }, 3000);
        }
    })
}

function generateGraph() {
    //Submit data file
    $('#uploadForm').ajaxSubmit({

        error: function() {
            console.log("error");
        },

        success: function(response) {
            console.log("Received ", response);
            $('#graphStatus').html(" " + response.msg);
            processing = false;
        }
    });

    return false;
}

$(document).ready(function() {

    //Socket io
    var socket = io.connect("http://localhost:3000");
    socket.on("NewNodeCreated", function(data) {
        console.log("Received node create on client");
    });

    //GUI callbacks
    $("#create").on("click", function() {
        createNewGraph();
    });

    $("[id*='yesLink']").on("click", function() {
        updateLinkInfo(this.id, 1);
    });

    $("[id*='noLink']").on("click", function() {
        updateLinkInfo(this.id, 0);
    });

    $('#generate').on("click", function() {
        generateGraph();
    });
});