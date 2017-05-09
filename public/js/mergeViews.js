/**
 * Created by DrTone on 30/03/2017.
 */

function onMapsFound(response) {
    let numMaps = response.msg.length;
    let thisAuthor = localStorage.getItem("TateUsername");
    let i, mapElem = $('#mapList'), mapInfo;
    for(i=0; i<numMaps; ++i) {
        mapInfo = response.msg[i];
        if(thisAuthor === mapInfo.author) {
            mapElem.append("<div class='row graphInfo'>" +
                "<div class='col-md-3'>" + mapInfo.name + "</a></div>" +
                "<div class='col-md-2'><input type='checkbox'></div>" +
                "</div>");
        }
    }
}

$(document).ready( ()=> {
    //Show own maps
    let mapManager = new MapManager();
    mapManager.getMaps(onMapsFound);

    $('#nextMerge').on("click", () => {
        $('#intro').hide();
        $('#introNext').show();
    })
});

