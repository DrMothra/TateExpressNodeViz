/**
 * Created by atg on 10/03/2017.
 */

exports.update = function(req, res, next) {
    res.render('updateNode', { graphID: req.body.updateNodeGraphID, graphName: req.body.updateNodeGraphName, node_Name: null, nodes: [], linkData: []});
};

exports.addNode = function(req, res, next) {
    res.render('addNode', { graphID: req.body.addNodeGraphID, graphName: req.body.addNodeGraphName} );
};

exports.deleteNode = function(req, res, next) {
    res.render('deleteNode', { graphID: req.body.deleteNodeGraphID, graphName: req.body.deleteNodeGraphName, node_Name: null, node: null, nodeData: []} );
};

exports.addLink = function(req, res, next) {
    res.render('addLink', { graphID: req.body.addLinkGraphID, graphName: req.body.addLinkGraphName} );
};

exports.deleteLink = function(req, res, next) {
    res.render('deleteLink', { graphID: req.body.deleteLinkGraphID, graphName: req.body.deleteLinkGraphName } );
};

exports.modifyGraph = function(req, res, next) {
    res.render('modifyGraph');
};

exports.showGraphs = function(req, res, next) {
    res.render('showGraphs');
};

exports.timeLineGraph = function(req, res, next) {
    res.render('timeLineGraph');
};

exports.mergeGraphs = function(req, res, next) {
    res.render('mergeGraphs');
};
