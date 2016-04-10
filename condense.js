//lib
var unirest = require('unirest');
var _ = require('lodash');
var Q = require('q');
var fs = require('fs');


//const
var DEST_ROUTE = '0.0.0.0\t';


//def
var self = {};
self.hostString = '';
self.hostCount = 0;
self.lastUpdate = '';
self.isRefresh = false;
self.refresh = function(){
	if( self.isRefresh ){
		return console.log('Refresh is in progress, ignore for now');
	}
	self.isRefresh = true;

	//config
	//black list
	var blackList = require('./config/black.list.json');
	// self.blackList = blackList;
	console.log('blackList', blackList);


	//white list
	var whiteList = require('./config/white.list.json');
	// self.whiteList = whiteList;
	var whiteListFromEnv = process.env.WHITE_LIST || '';
	if(whiteListFromEnv.length > 0){
		whiteListFromEnv = whiteListFromEnv.split(',');
		console.log(whiteListFromEnv);
		whiteList = whiteListFromEnv.concat( whiteList);
	}

	console.log('whiteList', whiteList);

	var promises = [];
	var resultHosts = {};
	_.each( blackList, function( curBlackListEntry ){
		var curDefer = Q.defer();
		promises.push(curDefer.promise);
		if (curBlackListEntry.indexOf('_') === 0){
			//dont call it
			curDefer.resolve();
		} else if (curBlackListEntry.indexOf('/') > 0){
			//rest
			unirest.get( curBlackListEntry )
				.end(function (response) {
					if(response.error){
						console.log('Error Rest', curBlackListEntry, response.error)
						curDefer.resolve('error');
						return;
					} else{
						try{
							var lines = response.body.replace(/\r/g, '').split('\n');
							_.each(lines, function(line){
								if (line.length > 0 && line.indexOf('#') === -1 && line.indexOf(':') === -1){
									//length non zero, not starting with #
									var lineSplit = line.split(/\s/);
									var hostName = _.trim( _.last( lineSplit ) );

									if(hostName !== 'localhost'){
										resultHosts[ hostName ] = true;
									}
								}
							});

							curDefer.resolve();	
						} catch(ex){
							console.log('Error Parsing', curBlackListEntry, ex)
						}
					}
				});
		} else{
			//local
			resultHosts[curBlackListEntry] = true;
			curDefer.resolve();
		}
	});

	console.log('Waiting on promises', promises.length)
	Q.all( promises ).then( function(){
		console.log( 'Total Blocked Hosts', _.size( resultHosts ) )
		console.log( 'Applying Whitelist Rule' );


		//filter out bad ones
		var hostString = '';
		var filteredHostsCount = 0;
		_.each( resultHosts, function(flag, host){
			var isValid = true;
			_.each( whiteList, function( curWhiteListEntry ){
				if (host.indexOf( curWhiteListEntry ) >= 0){
					return isValid = false;
				}
			})

			if (isValid){
				//host construction
				hostString += DEST_ROUTE + host + '\n';
				filteredHostsCount++;
			}
		});

		//clean up memory
		resultHosts = null;
		blackList = null;
		whiteList = null;

		//persist
		self.hostString = hostString;
		self.hostCount = filteredHostsCount;
		self.lastUpdate = new Date();

		console.log( 'Total Filter Blocked Hosts', filteredHostsCount )

		// write it to file
		fs.writeFileSync('./hosts', self.hostString, 'utf8');

		self.isRefresh = false;
	} );
}
module.exports = self;