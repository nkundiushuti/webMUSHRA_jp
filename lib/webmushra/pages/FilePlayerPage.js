/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

FilePlayerPage.prototype = Object.create(AudioPage.prototype);
FilePlayerPage.prototype.constructor = FilePlayerPage;

/**
* @class FilePlayerPage
*/
function FilePlayerPage(_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender, _audioContext, _bufferSize, _audioFileLoader, _errorHandler) {
  Object.getPrototypeOf(FilePlayerPage.prototype).constructor.call(this, _pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender, _audioContext, _bufferSize, _audioFileLoader, _errorHandler);
  this.filePlayer = null;
  this.inputController = null; 
};

FilePlayerPage.prototype.init = function (_audioFiles, _hideProgressBar) {
  Object.getPrototypeOf(FilePlayerPage.prototype).init.call(this);
  this.filePlayer = new FilePlayer(this.audioContext, this.bufferSize, _audioFiles, this.errorHandler, this.language, this.pageManager.getLocalizer(), _hideProgressBar); 
};

FilePlayerPage.prototype.load = function(_additionalQuestionnnaires) {
  Object.getPrototypeOf(FilePlayerPage.prototype).load.call(this, _additionalQuestionnnaires);
  this.filePlayer.init();
};

FilePlayerPage.prototype.save = function() {
  Object.getPrototypeOf(FilePlayerPage.prototype).save.call(this);
  this.inputController.unbind();
  this.filePlayer.free();
};

FilePlayerPage.prototype.render = function (_parent) {
  this.filePlayer.render(_parent);
  this.inputController = new FilePlayerController(this.filePlayer);
  this.inputController.bind();
  Object.getPrototypeOf(FilePlayerPage.prototype).render.call(this, _parent);
};
