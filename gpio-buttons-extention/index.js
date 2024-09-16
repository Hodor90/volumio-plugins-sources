'use strict';

var libQ = require('kew');
var Gpio = require('onoff').Gpio;
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');
var buttons = ["button0"];


module.exports = GPIOButtonsExtention;
function GPIOButtonsExtention(context) {
	var self = this;

	self.context = context;
	self.commandRouter = self.context.coreCommand;
	self.logger = self.context.logger;
	self.configManager = self.context.configManager;

}


GPIOButtonsExtention.prototype.onVolumioStart = function () {
	var self = this;
	var configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context, 'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

	self.logger.info("GPIO-Buttons-Extention initialized");

	return libQ.resolve();
}

GPIOButtonsExtention.prototype.onStart = function () {
	var self = this;
	var defer = libQ.defer();


	// Once the Plugin has successfull started resolve the promise
	defer.resolve();

	return defer.promise;
};

GPIOButtonsExtention.prototype.onStop = function () {
	var self = this;
	var defer = libQ.defer();

	// Once the Plugin has successfull stopped resolve the promise
	defer.resolve();

	return libQ.resolve();
};

GPIOButtonsExtention.prototype.onRestart = function () {
	var self = this;
	// Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------

GPIOButtonsExtention.prototype.getUIConfig = function () {
	var defer = libQ.defer();
	var self = this;

	self.logger.info('GPIO-Buttons-Extention: Getting UI config');

	var lang_code = 'en';

	self.commandRouter.i18nJson(__dirname + '/i18n/strings_' + lang_code + '.json',
		__dirname + '/i18n/strings_en.json',
		__dirname + '/UIConfig.json')
		.then(function (uiconf) {

			var i = 0;
			buttons.forEach(function (button, index, array) {

				var enabledDataField = button.concat('Enabled');
				var pinDataField = button.concat('Pin');
				var socketCmdDataField = button.concat('SocketCmd');
				var socketDataDataField = button.concat('SocketData');

				// Strings for config
				var enabledConfig = button.concat('.enabled');
				var pinConfig = button.concat('.pin');
				var socketCmdConfig = button.concat('.socketCmd');
				var socketDataConfig = button.concat('.socketData');

				uiconf.sections[0].content.forEach(element => {
					if (element.id === enabledDataField) {
						element.value = self.config.get(enabledConfig);
					}
					if (element.id === pinDataField) {
						element.value.value = self.config.get(pinConfig);
						element.value.label = self.config.get(pinConfig).toString();
					}
					if (element.id === socketCmdDataField) {
						element.value = self.config.get(socketCmdConfig);
					}
					if (element.id === socketDataDataField) {
						element.value = self.config.get(socketDataConfig);
					}
				});

				// uiconf.sections[0].content[2 * i].value = self.config.get(c1);
				// uiconf.sections[0].content[2 * i + 1].value.value = self.config.get(c2);
				// uiconf.sections[0].content[2 * i + 1].value.label = self.config.get(c2).toString();

				// i = i + 1;
			});

			defer.resolve(uiconf);
		})
		.fail(function () {
			defer.reject(new Error());
		});

	return defer.promise;
};

GPIOButtonsExtention.prototype.saveConfig = function (data) {
	var self = this;
	self.logger.info("Bin da!");

	buttons.forEach(function (button, index, array) {
		// Strings for data fields
		var enabledDataField = button.concat('Enabled');
		var pinDataField = button.concat('Pin');
		var socketCmdDataField = button.concat('SocketCmd');
		var socketDataDataField = button.concat('SocketData');

		// Strings for config
		var enabledConfig = button.concat('.enabled');
		var pinConfig = button.concat('.pin');
		var socketCmdConfig = button.concat('.socketCmd');
		var socketDataConfig = button.concat('.socketData');

		self.config.set(enabledConfig, data[enabledDataField]);
		self.config.set(pinConfig, data[pinDataField]['value']);
		self.config.set(socketCmdConfig, data[socketCmdDataField]);
		self.config.set(socketDataConfig, data[socketDataDataField]);
	});

	// self.clearTriggers()
	// 	.then(self.createTriggers());

	self.commandRouter.pushToastMessage('success', "GPIO-Buttons-Extention", "Configuration saved");
};

GPIOButtonsExtention.prototype.getConfigurationFiles = function () {
	return ['config.json'];
}

GPIOButtonsExtention.prototype.setUIConfig = function (data) {
	var self = this;
	//Perform your installation tasks here
};

GPIOButtonsExtention.prototype.getConf = function (varName) {
	var self = this;
	//Perform your installation tasks here
};

GPIOButtonsExtention.prototype.setConf = function (varName, varValue) {
	var self = this;
	//Perform your installation tasks here
};
