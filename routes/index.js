var express = require('express');
var router = express.Router();
var condense = require('../condense');
/* GET home page. */
router.get('/', function(req, res, next) {
    var data = {
        hostCount: condense.hostCount,
        lastUpdate: condense.lastUpdate
    };
    res.render('index', data);
});

router.get('/hosts', serveHost);
router.get('/host', serveHost);
router.get('/h', serveHost);
router.get('/adaway-hosts', serveHost);
router.get('/refresh', function(req, res, next) {
    res.send( 'Refresh is queued up' );
    condense.refresh();
});

function serveHost(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.send( condense.hostString );
}
module.exports = router;
