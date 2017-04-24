/**
 * Created by DrTone on 05/04/2017.
 */

let author;
let mapManager;

function onModifyViews(id) {
    //Get map id
    let mapID = id.slice(-1);
    if(isNaN(mapID)) {
        alert("Invalid map selected!");
        return;
    }

    let mapInfo = mapManager.getMapInfo(mapID);

    window.location.href = "/modifyMap?mapID="+mapInfo.graphID+"&name="+mapInfo.name;
}

function onMapsFound(response) {
    //List all maps via user
    let numMaps = response.msg.length;
    if(numMaps === 0) {
        $('#mapStatus').html("no perspectives");
        return;
    }

    let i, mapInfo, currentAuthor, mapElem = $('#mapList'), mapLink;
    for(i=0; i<numMaps; ++i) {
        mapInfo = response.msg[i];
        mapLink = "<a href='https://graphcommons.com/graphs/" + mapInfo.graphID + "' target='_blank'>";
        currentAuthor = mapInfo.author;
        if(currentAuthor === author) {
            mapManager.addMap(mapInfo);
            mapElem.append("<div class='row graphInfo'>" +
                "<div class='col-md-3'>" + mapLink + mapInfo.name + "</a></div>" +
                "<div class='col-md-2'> <button type='button' class='btn btn-primary modifyView' data-toggle='tooltip' data-placement='top' title='Modify this map'>Modify View</button>" +
                "<button type='button' class='btn btn-primary timeLine' data-toggle='tooltip' data-placement='top' title='Show map timeline'>Timeline</button></div>" +
                "</div>");
        }
    }

    $('.modifyView').attr("id", index => {
        return 'modifyViews' + index;
    });

    $("[id^='modifyViews']").on("click", function() {
        onModifyViews(this.id);
    });

    $('.timeLine').attr("id", index => {
        return 'timeLine' + index;
    });

    $("[id^='timeLine']").on("click", function() {
        onShowTimeLine(this.id);
    });
}

$(document).ready(()=> {
    //Get params from URL
    let params = new URLSearchParams(window.location.search);
    author = params.get('authorName');

    //Ensure we have graph
    if(!author) {
        alert("No author name in URL!");
        return;
    }

    $('#authorName').html(author);

    mapManager = new MapManager();
    mapManager.getMaps(onMapsFound);

    $('#createView').on("click", ()=> {
        window.location.href = "/createView";
    });
});
