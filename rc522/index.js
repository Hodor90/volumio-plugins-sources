'use strict';

var libQ = require('kew');

const io = require('socket.io-client');

module.exports = rc522;
function rc522(context) {
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;
}

rc522.prototype.onVolumioStart = function () {
	var self = this;
	var configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context, 'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

	return libQ.resolve();
}

rc522.prototype.onStart = function () {
	var self = this;
	var defer = libQ.defer();

	self.socket = io.connect('http://localhost:3000');

	self.socket.on('playingPlaylist', function (playlist) {//goto guy!
		self.currentPlaylist = playlist;
		self.logger.info('QQQ Currently playing playlist: ' + self.currentPlaylist)
	});

	// Once the Plugin has successfull started resolve the promise
	defer.resolve();

	return defer.promise;
};

rc522.prototype.onStop = function () {
	var self = this;
	var defer = libQ.defer();

	self.socket.removeAllListeners();
	self.socket.off();

	// Once the Plugin has successfull stopped resolve the promise
	defer.resolve();

	return libQ.resolve();
};

rc522.prototype.onRestart = function () {
	var self = this;
	// Optional, use if you need it
};

rc522.prototype.configRFID = function (data) {
	var self = this;
	self.logger.info('ICH WAR DA');

	self.socket.emit('listPlaylist');
	self.socket.once('pushListPlaylist', (playlists) => {
		self.logger.info('QQQ playlist ' + playlists);
	});

	self.socket.emit('getState', '');
	self.socket.once('pushState', (state) => {
		self.logger.info('QQQ STATE' + JSON.stringify(state));
	});

}

// Configuration Methods -----------------------------------------------------------------------------

rc522.prototype.getUIConfig = function () {
	var defer = libQ.defer();
	var self = this;

	var lang_code = this.commandRouter.sharedVars.get('language_code');

	self.commandRouter.i18nJson(__dirname + '/i18n/strings_' + lang_code + '.json',
		__dirname + '/i18n/strings_en.json',
		__dirname + '/UIConfig.json')
		.then(function (uiconf) {


			defer.resolve(uiconf);
		})
		.fail(function () {
			defer.reject(new Error());
		});

	return defer.promise;
};

rc522.prototype.getConfigurationFiles = function () {
	return ['config.json'];
}

rc522.prototype.setUIConfig = function (data) {
	var self = this;
	//Perform your installation tasks here
};

rc522.prototype.getConf = function (varName) {
	var self = this;
	//Perform your installation tasks here
};

rc522.prototype.setConf = function (varName, varValue) {
	var self = this;
	//Perform your installation tasks here
};

