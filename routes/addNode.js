/**
 * Created by DrTone on 01/02/2017.
 */

exports.addNode = function(req, res, next) {
    res.render('addNode', { graphID: req.body.addNodeGraphID, graphName: req.body.addNodeGraphName} );
};
