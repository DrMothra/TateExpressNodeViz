/**
 * Created by DrTone on 23/02/2017.
 */

exports.deleteNode = function(req, res, next) {
    res.render('deleteNode', { graphID: req.body.deleteNodeGraphID, graphName: req.body.deleteNodeGraphName, node_Name: null, node: null, nodeData: []} );
};
