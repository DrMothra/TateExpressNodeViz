/**
 * Created by DrTone on 15/12/2016.
 */

let graphManager = (function() {
    let currentGraphID = undefined;
    let processing = false;
    let mainGraphList = [];
    let yourGraphList = [];

    function sendData(data, callback) {
        $.ajax({
            type: data.method,
            data: data.data,
            url: data.url,
            dataType: data.dataType
        }).done((response)=> {
            //DEBUG
            console.log("Data sent");
            if(callback !== undefined) {
                callback(response);
            }
        })
    }

    function onGraphCreated(response) {
        $('#graphID').html(response.msg);
    }

    function onModifyGraph(id, type) {
        //Get graph id
        let graphID = id.slice(-1);
        console.log("ID = ", graphID);
        let graphInfo = type.indexOf("modifyTate") < 0 ? yourGraphList[graphID] : mainGraphList[graphID];

        window.location.href = "/modifyGraph?graphID="+graphInfo.graphID+"&name="+graphInfo.name;
    }

    function onCopyGraph(id) {
        //Get graph id
        let graphID = id.slice(-1);
        console.log("ID = ", graphID);

        let graphInfo = mainGraphList[graphID];
        graphInfo.userName = localStorage.getItem("TateUsername");

        let graphData = {
            method: "POST",
            data: graphInfo,
            url: '/processCopyGraph',
            dataType: 'JSON'};

        sendData(graphData, onGraphCopied);
        $('#graphStatus').html("Copying...");
    }

    function onGraphCopied() {
        //Refresh page
        //window.location.reload(true);
    }

    function onDeleteGraph(id) {
        let delGraph = confirm("Are you sure you want to delete this graph?");
        if(delGraph) {
            let graphID = id.slice(-1);
            let graphInfo = yourGraphList[graphID];

            let graphData = {
                method: "POST",
                data: graphInfo,
                url: '/processDeleteGraph',
                dataType: 'JSON'
            };

            sendData(graphData, ()=> {
                //Refresh graph status
                window.location.reload(true);
            });
        }
    }

    function onGraphsFound(response) {
        let i, graphInfo, numGraphs = response.msg.length;
        let currentUserName = localStorage.getItem("TateUsername");
        //DEBUG
        console.log("Username = ", currentUserName);

        if(currentUserName === undefined) {
            alert("You must be logged in!");
            return;
        }

        //General graphs
        let graphElem;
        let graphLink;
        for(i=0; i<numGraphs; ++i) {
            graphInfo = response.msg[i];
            graphLink = "<a href='https://graphcommons.com/graphs/" + graphInfo.graphID + "' target='_blank'>";
            graphElem = $('#graphList');
            if(graphInfo.author !== currentUserName) {
                mainGraphList.push(graphInfo);
                graphElem.append("<div class='row graphInfo'>" +
                    "<div class='col-md-2'>" + graphInfo.name + "</div>" +
                    "<div class='col-md-3'>" + graphLink + graphInfo.graphID + "</a></div>" +
                    "<div class='col-md-1'>" + graphInfo.author + "</div>" +
                    "<div class='col-md-2'> <button type='button' class='btn btn-primary' data-toggle='tooltip' data-placement='top' title='Copy graph to your account'>Create View</button>" +
                        "<button type='button' class='btn btn-primary modifyTate' data-toggle='tooltip' data-placement='top' title='Modify this graph'>Modify</button></div>" +
                    "</div>");
            } else {
                yourGraphList.push(graphInfo);
                graphElem = $('#yourGraphList');
                graphElem.append("<div class='row graphInfo'>" +
                    "<div class='col-md-2'>" + graphInfo.name + "</div>" +
                    "<div class='col-md-3'>" + graphLink + graphInfo.graphID + "</a></div>" +
                    "<div class='col-md-2'><button type='button' class='btn btn-primary modifyYours' data-toggle='tooltip' data-placement='top' title='Modify this graph'>Modify</button>" +
                        "<button type='button' class='btn btn-primary delete' data-toggle='tooltip' data-placement='top' title='Delete this graph'>Delete</button></div>" +
                    "</div>");
            }
        }
        //Set ids for buttons
        $('#graphList button').attr("id", (index, old)=> {
            return 'copyGraph' + index;
        });

        $('#graphList .modifyTate').attr("id", (index, old)=> {
            return 'modGraphTate' + index;
        });

        $('#yourGraphList .modifyYours').attr("id", (index, old)=> {
            return 'modGraphYours' + index;
        });

        $('#yourGraphList .delete').attr("id", (index, old)=> {
            return 'deleteGraph' + index;
        });

        $("[id^='modGraph']").on("click", function() {
            onModifyGraph(this.id, this.className);
        });

        $("[id^='deleteGraph']").on("click", function() {
            onDeleteGraph(this.id);
        });

        $("[id^='copyGraph']").on("click", function() {
            onCopyGraph(this.id);
        });
    }

    return {
        init: function() {

        },

        getGraphs: ()=> {
            //Get all graphs in account
            let searchInfo = {
                query: "TateCartographyProject"
            };
            let graphData = {method: "POST",
                data: searchInfo,
                url: '/processSearchCommons',
                dataType: 'JSON'};

            sendData(graphData, onGraphsFound);
        },

        createNewGraphID: ()=> {
            //Ensure we have graph name
            let name = $('#graphName').val();
            if(!name) {
                alert("Enter a graph name");
                return;
            }
            let description = $('#graphdescription').val();
            if(description === undefined) description = "";
            let userName = localStorage.getItem("TateUsername");
            if(userName === undefined) {
                alert("You must be logged in!");
                return;
            }
            let graphInfo = {
                name: name,
                subtitle: "TateCartographyProject",
                description: 'Author="'+userName+'"' + description
            };
            let graphData = {method: "POST",
                        data: graphInfo,
                        url: '/processGenerateNewGraphID',
                        dataType: 'JSON'};

            sendData(graphData, onGraphCreated);
        },

        createGraph: ()=> {
            //Submit data file
            $('#uploadForm').ajaxSubmit({

                error: ()=> {
                    console.log("error");
                },

                success: response => {
                    console.log("Received ", response);
                    $('#graphStatus').html(" " + response.msg);
                }
            });
        },

        graphCompleted: ()=> {
            //Refresh graph status
            window.location.reload(true);
        }
    }
})();

$(document).ready(()=> {

    //Check that logged in
    if(!LoginManager.userLoggedIn()) {
        alert("Please log in before continuing!");
        window.location.href = "/";
        return;
    }
    //Socket io
    if(socketManager === undefined) {
        socketManager = new SocketManager();
        socketManager.connect("http://localhost", 3000);
        let messages = [
            {msg: "NodesToCreate", element: "nodesToCreate"},
            {msg: "NewNodeCreated", element: "nodesCreated"},
            {msg: "EdgesToCreate", element: "edgesToCreate"},
            {msg: "NewEdgeCreated", element: "edgesCreated"},
            {msg: "GraphCompleted", element: "graphStatus", onReceived: graphManager.graphCompleted }
        ];
        let i, numMessages = messages.length, msg;
        for(i=0; i<numMessages; ++i) {
            msg = messages[i];
            socketManager.listen(messages[i]);
        }
    }

    //GUI callbacks
    graphManager.getGraphs();

    $("#createID").on("click", ()=> {
        graphManager.createNewGraphID();
    });

    $('#createGraph').on("click", ()=> {
        graphManager.createGraph();
    });

    $('#refreshGraphs').on("click", ()=> {
        window.location.reload(true);
    });
});