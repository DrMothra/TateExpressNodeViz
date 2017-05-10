/**
 * Created by DrTone on 30/03/2017.
 */

let myMaps=[], allMaps=[], mapSelected;
const NUM_MERGE_MAPS = 5;

function onSelectMap(id) {
    //Get map index
    let map = id.match(/\d/g);
    map = map.join("");
    if(isNaN(map)) {
        console.log("Invalid map selected!");
        return;
    }
    mapSelected = myMaps[map];
}

function onMapsFound(response) {
    //Auto-complete
    $('.maps').typeahead( {source: response.msg} );

    let numMaps = response.msg.length;
    let thisAuthor = localStorage.getItem("TateUsername");
    let i, mapElem = $('#mapList'), mapInfo;
    for(i=0; i<numMaps; ++i) {
        mapInfo = response.msg[i];
        allMaps.push(mapInfo);
        if(thisAuthor === mapInfo.author) {
            myMaps.push(mapInfo);
            mapElem.append("<div class='row graphInfo'>" +
                "<div class='col-md-3'>" + mapInfo.name + "</a></div>" +
                "<div class='col-md-2'><input type='checkbox' class='selectMap'></div>" +
                "</div>");
        }
    }
    //Set up id's
    $('.selectMap').attr("id", index => {
        return 'selectMap' + index;
    });

    $("[id^='selectMap']").on("click", function() {
        $('.selectMap').prop("checked", false);
        $(this).prop("checked", true);
        onSelectMap(this.id);
    });
}

function validateForm() {
    //Check all map names
    let mapBaseName = "mapName";
    let mapName, i, empty = true;
    for(i=0; i<NUM_MERGE_MAPS; ++i) {
        mapName = mapBaseName + i;
        if($('#'+mapName).val()) {
            empty = false;
        }
    }
    if(empty) {
        alert("Enter a map name!");
        return false;
    }

    //Add source info
    $('#mapNameDest').val($('#mapName').val());
    $('#mapIDDest').val(mapSelected !== undefined ? mapSelected.graphID : "");

    //Get id's of source maps
    let mapBaseID = "mapID", mapID;
    let j, numMaps = allMaps.length;
    for(j=1; j<=NUM_MERGE_MAPS; ++j) {
        mapName = mapBaseName + j;
        mapName = $('#'+mapName).val();
        for(i=0; i<numMaps; ++i) {
            if(mapName === allMaps[i].name) {
                mapID = mapBaseID + j;
                $('#'+mapID).val(allMaps[i].graphID);
                break;
            }
        }
    }

    return true;
}

$(document).ready( ()=> {
    //Show own maps
    let mapManager = new MapManager();
    mapManager.getMaps(onMapsFound);
    let mapName;

    $('#nextMerge').on("click", () => {
        mapName = $('#mapName').val();
        if(!mapName && mapSelected === undefined) {
            alert("No map selected!");
            return;
        }
        $('#intro').hide();
        $('#introNext').show();
    });

    $('#mergeBack').on("click", () => {
        $('#intro').show();
        $('#introNext').hide();
    });

    $('#mergeForm').on("submit", () => {
        return validateForm();
    });
});

