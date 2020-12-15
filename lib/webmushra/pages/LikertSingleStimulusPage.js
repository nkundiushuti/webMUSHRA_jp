/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

LikertSingleStimulusPage.prototype = Object.create(FilePlayerPage.prototype);
LikertSingleStimulusPage.prototype.constructor = LikertSingleStimulusPage;

function LikertSingleStimulusPage(_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender, _audioContext, _bufferSize, _audioFileLoader, _errorHandler, _stimulus) {
  Object.getPrototypeOf(LikertSingleStimulusPage.prototype).constructor.call(this, _pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender, _audioContext, _bufferSize, _audioFileLoader, _errorHandler);
  this.stimulus = _stimulus;
  
  Object.getPrototypeOf(LikertSingleStimulusPage.prototype).addAudioFile.call(this, this.stimulus.getFilepath(), this.stimulus);
  this.waveformVisualizer = null;
  this.ratingMap = {};
    
  this.time = 0;
  this.startTimeOnPage = null;
} 

LikertSingleStimulusPage.prototype.init = function () {
  Object.getPrototypeOf(LikertSingleStimulusPage.prototype).init.call(this, [this.stimulus], this.pageConfig.showWaveform);
  
  if (this.pageConfig.mustPlayback) {
    this.filePlayer.genericAudioControl.addEventListener((function (_event) {
      if (_event.name == this.pageConfig.mustPlayback) {
        this.enableQuestionnaire(this.pageConfig.questionnaire);
      }
    }).bind(this));
  }
};

LikertSingleStimulusPage.prototype.render = function (_parent) {  
  var div = $("<div></div>");
  _parent.append(div);

  var content; 
  if(this.pageConfig.content === null){
    content ="";
  } else {
    content = this.pageConfig.content;
  }
  
  var p = $("<p>" + content + "</p>");
  div.append(p);
      
  if (this.pageConfig.showWaveform === true) {
    var waveform = $("<p></p>");
    div.append(waveform);
    
    this.waveformVisualizer = new WaveformVisualizer(this.pageManager.getPageVariableName(this) + ".waveformVisualizer", waveform, this.stimulus, this.pageConfig.showWaveform, false, this.filePlayer.genericAudioControl);
    this.waveformVisualizer.create();
    this.waveformVisualizer.load();
  }
  Object.getPrototypeOf(LikertSingleStimulusPage.prototype).render.call(this, _parent);
};

LikertSingleStimulusPage.prototype.load = function () {
  Object.getPrototypeOf(LikertSingleStimulusPage.prototype).load.call(this);
  this.startTimeOnPage = new Date();
};

LikertSingleStimulusPage.prototype.save = function () {
  Object.getPrototypeOf(LikertSingleStimulusPage.prototype).save.call(this);
  this.time += (new Date() - this.startTimeOnPage);
};

LikertSingleStimulusPage.prototype.store = function () {
  var trial = this.session.getTrial(this.pageConfig.type, this.pageConfig.id);
  if (trial === null) {
    trial = new Trial();
    trial.type = this.pageConfig.type;
    trial.id = this.pageConfig.id;
    this.session.trials[this.session.trials.length] = trial;
  }
  var rating = new LikertResponse();
  rating.stimulus = this.stimulus.id;
  
  rating.stimulusRating = {};
  rating.time = this.time;
  trial.responses[trial.responses.length] = rating;
  Object.getPrototypeOf(LikertSingleStimulusPage.prototype).store.call(this, rating.stimulusRating, this.session.trials);
};
