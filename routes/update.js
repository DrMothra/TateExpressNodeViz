/**
 * Created by DrTone on 31/01/2017.
 */

exports.update = function(req, res, next) {

    res.render('update', { graphID: req.body.updateNodeGraphID, node_Name: null, node: null, linkData: []});
};


