/**
 * Created by atg on 16/01/2017.
 */

//Configure graph commons library
var gc = require("graphcommons");
var accesskey = process.env.GRAPH_COMMONS_API_KEY;
var currentGraphID;

exports.graph = new gc(accesskey, function(result) {
    console.log("Created graph commons = ", result);
});

exports.setCurrentGraphID = function(id) {
    currentGraphID = id;
};

