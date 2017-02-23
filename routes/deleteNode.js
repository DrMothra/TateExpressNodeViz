/**
 * Created by DrTone on 23/02/2017.
 */

exports.deleteNode = function(req, res, next) {
    //DEBUG
    console.log("deleteNode graph id = ", req.body.deleteNodeGraphID);

    res.render('deleteNode', { graphID: req.body.deleteNodeGraphID, node_Name: null, node: null, nodeData: []} );
};
