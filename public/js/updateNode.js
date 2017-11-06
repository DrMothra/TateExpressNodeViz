/**
 * Created by DrTone on 02/02/2017.
 */

let graphNodeNames, currentIndex = -1;
let waitStatus = '#waiting';
let status = '#updated';
let errorStatus = '#error';
let submitted = false;

function onLinkUpdated(response) {
    let link = response.index;

    $(waitStatus + link).hide();
    let elem = $(status + link);
    elem.show();
    elem.html(response.msg);
    setTimeout(function() {
        elem.hide();
        submitted = false;
    }, 3000);
}

function onLinkError() {
    let link = currentIndex;

    $(waitStatus + link).hide();
    $(status + link).hide();
    $(errorStatus + link).show();
    submitted = false;
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

function validateDescForm() {
    if($('#descName').val() === "") {
        alert("Enter a description!");
        return false;
    }

    let nodeName = $('#node_Name');
    if(nodeName.val() === "") {
        alert("Enter an item in the Content box!");
        return false;
    }

    $('#descNodeValue').val(nodeName.val());

    return true;
}

function validateRenameForm() {
    if($('#renameName').val() === "") {
        alert("Enter a name!");
        return false;
    }

    let nodeName = $('#node_Name');
    if(nodeName.val() === "") {
        alert("Enter an item in the Content box!");
        return false;
    }

    $('#renameNodeValue').val(nodeName.val());

    return true;
}

function uploadImage() {
    let uploadStatus = $('#uploadImageStatus');
    uploadStatus.hide();
    let waitImageStatus = $('#uploadImageWaitStatus');
    waitImageStatus.show();
    let errorImageStatus = $('#uploadImageErrorStatus');
    errorImageStatus.hide();
    submitted = true;
    $('#imageForm').ajaxSubmit({

        error: function() {
            console.log("Error uploading image");
            waitImageStatus.hide();
            errorImageStatus.show();
            submitted = false;
        },

        success: function(response) {
            waitImageStatus.hide();
            errorImageStatus.hide();
            uploadStatus.show();
            uploadStatus.html(response.msg);
            submitted = false;
        }
    });
}

function uploadRef() {
    let uploadStatus = $('#uploadRefStatus');
    uploadStatus.hide();
    let waitRefStatus = $('#uploadRefWaitStatus');
    waitRefStatus.show();
    let errorRefStatus = $('#uploadRefErrorStatus');
    errorRefStatus.hide();
    submitted = true;
    $('#refForm').ajaxSubmit({

        error: function() {
            console.log("Error uploading ref");
            uploadStatus.hide();
            waitRefStatus.hide();
            errorRefStatus.show();
            submitted = false;
        },

        success: function(response) {
            waitRefStatus.hide();
            errorRefStatus.hide();
            uploadStatus.show();
            uploadStatus.html(response.msg);
            submitted = false;
        }
    })
}

function uploadDesc() {
    let uploadStatus = $('#uploadDescStatus');
    uploadStatus.hide();
    let waitRefStatus = $('#uploadDescWaitStatus');
    waitRefStatus.show();
    let errorRefStatus = $('#uploadDescErrorStatus');
    errorRefStatus.hide();
    submitted = true;
    $('#descForm').ajaxSubmit({

        error: function() {
            console.log("Error uploading description");
            uploadStatus.hide();
            waitRefStatus.hide();
            errorRefStatus.show();
            submitted = false;
        },

        success: function(response) {
            waitRefStatus.hide();
            errorRefStatus.hide();
            uploadStatus.show();
            uploadStatus.html(response.msg);
            submitted = false;
        }
    })
}

function renameNode() {
    let uploadStatus = $('#uploadRenameStatus');
    uploadStatus.hide();
    let waitRefStatus = $('#uploadRenameWaitStatus');
    waitRefStatus.show();
    let errorRefStatus = $('#uploadRenameErrorStatus');
    errorRefStatus.hide();
    submitted = true;
    $('#renameForm').ajaxSubmit({

        error: function() {
            console.log("Error renaming node");
            uploadStatus.hide();
            waitRefStatus.hide();
            errorRefStatus.show();
            submitted = false;
        },

        success: function(response) {
            waitRefStatus.hide();
            errorRefStatus.hide();
            uploadStatus.show();
            uploadStatus.html(response.msg);
            submitted = false;
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
        if(submitted) {
            console.log("Already submitted");
            return;
        }
        if(!validateImageForm()) return;
        $('#uploadImageStatus').hide();
        uploadImage();
    });

    $('#uploadRef').on("click", () => {
        if(submitted) {
            console.log("Already submitted");
            return;
        }
        if(!validateRefForm()) return;
        $('#uploadRefStatus').hide();
        uploadRef();
    });

    $('#uploadDesc').on("click", () => {
        if(submitted) {
            console.log("Already submitted");
            return;
        }
        if(!validateDescForm()) return;
        $('#uploadDescStatus').hide();
        uploadDesc();
    });

    $('#renameNode').on("click", () => {
        if(submitted) {
            console.log("Already submitted");
            return;
        }
        if(!validateRenameForm()) return;
        $('#uploadRenameStatus').hide();
        renameNode();
    });

    $("[id*='yesLink']").on("click", function() {
        if(submitted) {
            console.log("Already submitted");
            return;
        }
        let index = getLinkID(this.id);
        if(index < 0) return;

        currentIndex = index;
        $('#waiting' + index).show();
        submitted = true;
        mapManager.updateLinkInfo(index, nodeName, 1, onLinkUpdated, onLinkError);
    });

    $("[id*='noLink']").on("click", function() {
        if(submitted) {
            console.log("Already submitted");
            return;
        }
        let index = getLinkID(this.id);
        if(index < 0) return;

        currentIndex = index;
        $('#waiting' + index).show();
        submitted = true;
        mapManager.updateLinkInfo(index, nodeName, 0, onLinkUpdated, onLinkError);
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

function getLinkID(link) {
    let index = link.match(/\d/g);
    index = index.join("");
    if(isNaN(index)) {
        console.log("Invalid map selected!");
        return -1;
    }

    return index;
}