/**
 * Created by DrTone on 02/02/2017.
 */

let graphNodeNames;

function onLinkUpdated(response) {
    let link = response.index;

    let elem = $('#updated'+link);
    elem.show();
    elem.html(response.msg);
    setTimeout(function() {
        elem.hide();
    }, 3000);
}

function onGetNodeNames(response) {
    graphNodeNames = response.msg;
    $('#node_Name').typeahead( {source: graphNodeNames} );
}

function onBack() {
    let mapID = $('#mapID').val();
    let name = $('#mapName').html();
    window.location.href = "/modifyMap?mapID="+mapID+"&name="+name;
}

function validateForm() {
    if($('#mapID').val() === "") {
        alert("Enter a map ID");
        return false;
    }

    let nodeName = $('#node_Name').val();
    if(nodeName === "") {
        alert("Enter a node name");
        return false;
    }
    if(graphNodeNames.indexOf(nodeName) < 0) {
        alert("Node not in map!");
        return false;
    }

    return true;
}

$(document).ready(function() {

    //Check that logged in
    if(!LoginManager.userLoggedIn()) {
        alert("Please log in before continuing!");
        window.location.href = "/";
        return;
    }

    let mapID = $('#mapID').val();
    let mapManager = new MapManager();
    mapManager.getGraphNodeNames(mapID, onGetNodeNames);


    $('.getMapID').val(mapID);

    $('#getLinksForm').on("submit", function() {
        return validateForm();
    });

    let nodeName = $('#node_Name').val();
    $("[id*='yesLink']").on("click", function() {
        mapManager.updateLinkInfo(this.id, nodeName, 1, onLinkUpdated);
    });

    $("[id*='noLink']").on("click", function() {
        mapManager.updateLinkInfo(this.id, nodeName, 0, onLinkUpdated);
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
