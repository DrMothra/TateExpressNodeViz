/**
 * Created by DrTone on 05/04/2017.
 */


function getGraphs() {

}

$(document).ready(()=> {
    //Get params from URL
    let params = new URLSearchParams(window.location.search);
    let author = params.get('authorName');

    //Ensure we have graph
    if(!author) {
        alert("No author name in URL!");
        return;
    }

    $('#authorName').html(author);

    getGraphs(author);
});
