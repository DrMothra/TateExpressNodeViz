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

function validateImageForm() {
    if($('#imageName').val() === "") {
        alert("Enter an image link!");
        return false;
    }

    let nodeName = $('#node_Name');
    if(nodeName.val() === "") {
        alert("Enter an item in the Content box!");
        return false;
    }

    $('#imageNodeValue').val(nodeName.val());

    return true;
}

function validateRefForm() {
    if($('#refName').val() === "") {
        alert("Enter a reference link!");
        return false;
    }

    let nodeName = $('#node_Name');
    if(nodeName.val() === "") {
        alert("Enter an item in the Content box!");
        return false;
    }

    $('#refNodeValue').val(nodeName.val());

    return true;
}

function uploadImage() {
    $('#imageForm').ajaxSubmit({

        error: function() {
            console.log("Error uploading image");
        },

        success: function(response) {
            $('#uploadImageStatus').show();
            $('#uploadImageStatus').html(response.msg);
        }
    });
}

function uploadRef() {
    $('#refForm').ajaxSubmit({

        error: function() {
            console.log("Error uploading ref");
        },

        success: function(response) {
            $('#uploadRefStatus').show();
            $('#uploadRefStatus').html(response.msg);
        }
    })
}

$(document).ready(function() {

    //Check that logged in
    if(!LoginManager.userLoggedIn()) {
        alert("Please log in before continuing!");
        window.location.href = "/";
        return;
    }

    let mapID = $('#mapID').val();
    let nodeName = $('#node_Name').val();
    let mapManager = new MapManager();
    mapManager.getGraphNodeNames(mapID, onGetNodeNames);


    $('.getMapID').val(mapID);

    $('#getLinksForm').on("submit", function() {
        return validateForm();
    });

    $('#uploadImage').on("click", () => {
        if(!validateImageForm()) return;
        $('#uploadImageStatus').hide();
        uploadImage();
    });

    $('#uploadRef').on("click", () => {
        if(!validateRefForm()) return;
        $('#uploadRefStatus').hide();
        uploadRef();
    });


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
