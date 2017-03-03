/**
 * Created by DrTone on 01/02/2017.
 */

exports.addLink = function(req, res, next) {
    res.render('addLink', { graphID: req.body.addLinkGraphID, graphName: req.body.addLinkGraphName} );
};
