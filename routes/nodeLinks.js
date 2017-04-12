/**
 * Created by atg on 10/03/2017.
 */

exports.update = function(req, res, next) {
    res.render('updateNode', { mapID: req.body.updateNodeMapID, mapName: req.body.updateNodeMapName, node_Name: null, nodes: [], linkData: []});
};

exports.createView = function(req, res, next) {
    res.render('createView');
};

exports.addNode = function(req, res, next) {
    res.render('addNode', { mapID: req.body.addNodeMapID, mapName: req.body.addNodeMapName} );
};

exports.deleteNode = function(req, res, next) {
    res.render('deleteNode', { mapID: req.body.deleteNodeMapID, mapName: req.body.deleteNodeMapName, node_Name: null, node: null, nodeData: []} );
};

exports.addLink = function(req, res, next) {
    res.render('addLink', { mapID: req.body.addLinkMapID, mapName: req.body.addLinkMapName} );
};

exports.deleteLink = function(req, res, next) {
    res.render('deleteLink', { mapID: req.body.deleteLinkMapID, mapName: req.body.deleteLinkMapName } );
};

exports.modifyMap = function(req, res, next) {
    res.render('modifyMap');
};

exports.showGraphs = function(req, res, next) {
    res.render('showGraphs');
};

exports.showAuthorGraphs = function(req, res, next) {
    res.render('showAuthorGraphs');
};

exports.showMyViews = (req, res, next) => {
    res.render('showMyViews');
};

exports.timeLineGraph = function(req, res, next) {
    res.render('timeLineGraph');
};

exports.mergeGraphs = function(req, res, next) {
    res.render('mergeGraphs');
};
