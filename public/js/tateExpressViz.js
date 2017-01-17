/**
 * Created by DrTone on 15/12/2016.
 */

function generateGraphID() {
    //Generate new graph
    var id = {
        id: 6,
        status: "OK"
    };

    $.ajax({
        type: 'POST',
        data: id,
        url: '/generateGraph',
        dataType: 'JSON'
    }).done(function(response) {
        console.log("Response = ", response);
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
        url: '/process_links',
        dataType: 'JSON'
    }).done(function(response) {
        if(response.msg === 'OK') {
            console.log("Weight updated");
        }
    })
}

function generateGraph() {
    //Submit data file
    $('#uploadForm').ajaxSubmit({

        error: function() {
            console.log("error");
        },

        success: function() {
            console.log("All OK");
        }
    });

    return false;
}

$(document).ready(function() {

    //GUI callbacks
    $("#create").on("click", function() {
        generateGraphID();
    });

    $("[id*='yesLink']").on("click", function() {
        updateLinkInfo(this.id, true);
    });

    $("[id*='noLink']").on("click", function() {
        updateLinkInfo(this.id, false);
    });

    $('#generate').on("click", function() {
        generateGraph();
    });
});