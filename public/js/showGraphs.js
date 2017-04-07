/**
 * Created by DrTone on 15/12/2016.
 */

let graphManager = (function() {
    let currentGraphID = undefined;
    let processing = false;
    let mainGraphList = [];
    let authors = [];
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

    function onShowViews(id) {
        //Get author id
        let authorID = id.slice(-1);
        authorID = parseInt(authorID, 10);
        if(isNaN(authorID)) {
            alert("Invalid author selected");
            return;
        }

        let currentAuthor = authors[authorID];
        //DEBUG
        console.log("Author = ", currentAuthor);

        window.location.href = "/showAuthorGraphs?authorName="+currentAuthor;
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
        //Get number of authors
        let currentAuthor;
        for(i=0; i<numGraphs; ++i) {
            graphInfo = response.msg[i];
            currentAuthor = graphInfo.author;
            if(authors.indexOf(currentAuthor) < 0 && currentAuthor!== currentUserName) {
                authors.push(currentAuthor);
            }
        }
        let numAuthors = authors.length;
        for(i=0; i<numAuthors; ++i) {
            currentAuthor = authors[i];
            graphElem = $('#graphList');
            if(currentAuthor !== currentUserName) {
                mainGraphList.push(currentAuthor);
                graphElem.append("<div class='row graphInfo'>" +
                    "<div class='col-md-3'>" + currentAuthor + "</div>" +
                    "<div class='col-md-2'> <button type='button' class='btn btn-primary showViews' data-toggle='tooltip' data-placement='top' title='Show authors maps'>Show Views</button></div>" +
                    "</div>");
            }
        }
        //Set ids for buttons
        $('.showViews').attr("id", index => {
            return 'showViews' + index;
        });

        $("[id^='showViews']").on("click", function() {
            onShowViews(this.id);
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

        showMyViews: ()=> {
            //Get current user's graphs
            let userName = localStorage.getItem("TateUsername");
            if(!userName) {
                alert("Please log in to see your views!");
                return;
            }

            window.location.href = "/showMyViews?authorName="+userName;
        }
    }
})();

$(document).ready(()=> {

    //Check that logged in
    /*
    if(!LoginManager.userLoggedIn()) {
        alert("Please log in before continuing!");
        window.location.href = "/";
        return;
    }
    */

    //GUI callbacks
    graphManager.getGraphs();

    $('#myViews').on("click", () => {
        graphManager.showMyViews();
    });
});