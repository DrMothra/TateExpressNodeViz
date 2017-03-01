/**
 * Created by DrTone on 01/03/2017.
 */

exports.deleteLink = function(req, res, next) {
    res.render('deleteLink', { graphID: req.body.deleteLinkGraphID} );
};
