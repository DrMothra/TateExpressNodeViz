/**
 * Created by DrTone on 15/12/2016.
 */


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

$(document).ready(function() {

    //GUI callbacks
    $('#0yesLink').on("click", function() {
        updateLinkInfo(this.id, true);
    })
});