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

function validateForm(destMap) {
    //Check all map names
    let mapBaseName = "mapName";
    let mapName, i, empty = true;
    let numMaps = 0;
    for (i = 0; i < NUM_MERGE_MAPS; ++i) {
        mapName = mapBaseName + i;
        if ($('#' + mapName).val()) {
            ++numMaps;
            empty = false;
        }
    }
    if(empty) {
        alert("Enter a map name!");
        return false;
    }

    if(destMap && numMaps < 2) {
        alert("Need 2 maps to merge - enter another map!");
        return false;
    }

    return true;
}

function mergeMaps() {
    //Add source info
    $('#author').val(localStorage.getItem("TateUsername"));
    $('#mapNameDest').val($('#mapName').val());
    $('#mapIDDest').val(mapSelected !== undefined ? mapSelected.graphID : "");

    //Get id's of source maps
    let mapBaseName = "mapName", mapName;
    let mapBaseID = "mapID", mapID;
    let i, j, numMaps = allMaps.length;
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

    $('#mergeForm').ajaxSubmit({

        error: function() {
            console.log("Error merging maps");
        },

        success: function(response) {
            console.log("Received ", response);
            $('#mergeStatus').html(response.msg);
        }
    });
}

function onMapsMerged(response) {
    $('#mergeStatus').html(response);
}

$(document).ready( ()=> {
    //Show own maps
    let mapManager = new MapManager();
    mapManager.getMaps(onMapsFound);
    let mapName;

    $('#nextMerge').on("click", () => {
        mapName = $('#mapName').val();
        if(!mapName && mapSelected === undefined) {
            alert("Enter a map name or select one of your maps!");
            return;
        }
        $('#intro').hide();
        $('#introNext').show();
    });

    $('#mergeBack').on("click", () => {
        $('#intro').show();
        $('#introNext').hide();
    });

    $('#mergeMaps').on("click", () => {
        mapName = $('#mapName').val();
        if(validateForm(mapName)) {
            let updates = [
                {msg: "MapsMerged", callback: onMapsMerged}
            ];
            let i, numMessages = updates.length;
            for(i=0; i<numMessages; ++i) {
                mapManager.sendUpdates(updates[i].msg, updates[i].callback);
            }
            mergeMaps();
        }
    });
});

