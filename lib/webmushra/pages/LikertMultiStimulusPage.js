/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

LikertMultiStimulusPage.prototype = Object.create(Page.prototype);
LikertMultiStimulusPage.prototype.constructor = LikertMultiStimulusPage;

function LikertMultiStimulusPage(_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender, _audioContext, _bufferSize, _audioFileLoader, _errorHandler) {
  Object.getPrototypeOf(LikertMultiStimulusPage.prototype).constructor.call(this, _pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender);
  this.audioContext = _audioContext;
  this.bufferSize = _bufferSize;
  this.audioFileLoader = _audioFileLoader;
  this.errorHandler = _errorHandler;
  this.fpc = null; 
  
  this.time = 0;
  this.startTimeOnPage = null;

  this.stimuli = [];
  for (var key in _pageConfig.stimuli) {
    this.stimuli[this.stimuli.length] = new Stimulus(key, _pageConfig.stimuli[key]);
  }
  shuffle(this.stimuli);
  
  for (var i = 0; i < this.stimuli.length; ++i) {
    this.audioFileLoader.addFile(this.stimuli[i].getFilepath(), (function (_buffer, _stimulus) { _stimulus.setAudioBuffer(_buffer); }), this.stimuli[i]);
  }
  this.filePlayer = null;
  this.stimulusResponses = [];
} 

LikertMultiStimulusPage.prototype.init = function (_callbackError) {
  Object.getPrototypeOf(LikertMultiStimulusPage.prototype).init.call(this);

  for (var i = 0; i < this.stimuli.length; ++i) {
    this.stimulusResponses[i] = {};
    for (var j = 0; j < this.pageConfig.stimulusQuestionnaire.length; ++j) {
      var element = this.pageConfig.stimulusQuestionnaire[j];
      if (element.type === "likert") {
        var name = i+"_"+element.name;
        this.likertObjects[name] = new LikertScale(element.response, name, this.pageConfig.mustPlayback);
      }
    }
  }
  this.filePlayer = new FilePlayer(this.audioContext, this.bufferSize, this.stimuli, this.errorHandler, this.language, this.pageManager.getLocalizer());
  if (this.pageConfig.mustPlayback) {
    this.filePlayer.genericAudioControl.addEventListener((function (_event) {
      if (_event.name == this.pageConfig.mustPlayback) {
        this.enableQuestionnaire(this.pageConfig.stimulusQuestionnaire, _event.index+"_");
        this.enableQuestionnaire(this.pageConfig.questionnaire);
      } 
    }).bind(this));

	}

};
LikertMultiStimulusPage.prototype.render = function (_parent) {  
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

  this.filePlayer.render(_parent);
  
  for (var i = 0; i < this.stimuli.length; ++i) {
    var table = this.renderQuestionnaire(this.pageConfig.stimulusQuestionnaire, i+"_");
    this.filePlayer.getHook(i).append(table);
  }
  
  this.fpc = new FilePlayerController(this.filePlayer);
  this.fpc.bind();
  Object.getPrototypeOf(LikertMultiStimulusPage.prototype).render.call(this, _parent);
};

LikertMultiStimulusPage.prototype.load = function () {
  this.startTimeOnPage = new Date();
  var stimulusQuestionnaires = [];
  for (var i = 0; i < this.stimuli.length; ++i) {
    this.restoreQuestionnaire(this.pageConfig.stimulusQuestionnaire, this.stimulusResponses[i], i+"_");
    stimulusQuestionnaires[stimulusQuestionnaires.length] = [this.pageConfig.stimulusQuestionnaire, i+"_"];
  }
  Object.getPrototypeOf(LikertMultiStimulusPage.prototype).load.call(this, stimulusQuestionnaires);
  this.filePlayer.init();
};

LikertMultiStimulusPage.prototype.save = function () {
  Object.getPrototypeOf(LikertMultiStimulusPage.prototype).save.call(this);
  this.fpc.unbind(); 
  this.time += (new Date() - this.startTimeOnPage);
  for (var i = 0; i < this.stimuli.length; ++i) {
    this.readQuestionnaire(this.pageConfig.stimulusQuestionnaire, this.stimulusResponses[i], i+"_");
  }
  this.filePlayer.free();
};

LikertMultiStimulusPage.prototype.store = function () {
  trial = new Trial();
  trial.type = this.pageConfig.type;
  trial.id = this.pageConfig.id;
  
  for(var i = 0; i < this.stimuli.length; ++i) {
      
    var rating = new LikertResponse();
    
    rating.stimulus = this.stimuli[i].id;
    rating.stimulusRating = this.stimulusResponses[i];
    
    rating.time = this.time;
    trial.responses[trial.responses.length] = rating;
  }
  this.session.trials[this.session.trials.length] = trial;
  Object.getPrototypeOf(LikertMultiStimulusPage.prototype).store.call(this, trial, this.session.trials);
};
