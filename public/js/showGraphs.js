/**
 * Created by DrTone on 15/12/2016.
 */
function onShowViews(author) {
    //Show author views
    window.location.href = "/showViews?authorName="+author;
}

function onMapsFound(response) {
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
    let currentAuthor, authors = [];
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
            graphElem.append("<div class='row graphInfo'>" +
                "<div class='col-md-3'>" + currentAuthor + "</div>" +
                "<div class='col-md-2'> <button type='button' class='btn btn-primary showViews' data-toggle='tooltip' data-placement='top' title='Show authors maps'>Show Overviews</button></div>" +
                "</div>");
        }
    }
    //Set ids for buttons
    $('.showViews').attr("id", index => {
        return 'showViews' + index;
    });

    $("[id^='showViews']").on("click", function() {
        let id = this.id.match(/\d/g);
        onShowViews(authors[id]);
    });
}

function showMyViews() {
    //See if logged in
    let userName = localStorage.getItem("TateUsername");
    if(!userName) {
        alert("Please log in to see your views!");
        return;
    }

    window.location.href = "/showViews?authorName="+userName;
}

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
    let mapManager = new MapManager();
    mapManager.getMaps(onMapsFound);

    $('#myViews').on("click", () => {
        showMyViews();
    });
});