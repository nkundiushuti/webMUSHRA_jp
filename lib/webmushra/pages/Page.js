/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

function Page(_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender) {
  this.pageManager = _pageManager;
  this.pageTemplateRenderer = _pageTemplateRenderer;
  this.pageConfig = _pageConfig;
  this.session = _session;
  this.language = _language;
  this.dataSender = _dataSender;
  this.sendError = false;
  if (this.pageConfig.questionnaire === undefined) {
    this.pageConfig.questionnaire = [];
  }
  this.questionnaireResponses = {};
  this.likertObjects = {};
}

/**
 * @return {String} Returns the name of the page. Objects of a Page class might have different names.  
 */
Page.prototype.getName = function() {
  return this.pageConfig.name;
};

/**
 * The init method is called before the pages are rendered. The method is called only once.
 * @param {Function} _callbackError The function that must be called if an error occurs. The function has one argument which is the error message.
 */
Page.prototype.init = function(_callbackError) {
  for (var i = 0; i < this.pageConfig.questionnaire.length; ++i) {
    var element = this.pageConfig.questionnaire[i];
    if (element.type === "likert") {
      this.likertObjects[element.name] = new LikertScale(element.response, element.name, this.pageConfig.mustPlayback);
    }
  }
};

Page.prototype.renderQuestionnaire = function(_questionnaireConfig) {
  var table = $("<table align='center'></table>");
  
  for (var i = 0; i < _questionnaireConfig.length; ++i) {
    var element = _questionnaireConfig[i];
    if (element.type === "text") {
      table.append($("<tr><td><strong>" + element.label + "</strong></td><td><input type='text' id='" + element.name + "' /></td></tr>"));
    } else if (element.type === "number") {
      table.append($("<tr><td><strong>" + element.label + "</strong></td><td><input id='" + element.name + "' min='" + element.min + "' max='" + element.max + "' value='" + element.default + "' data-inline='true'/></td></tr>"));
    } else if (element.type === "likert") {
      var label = $("<td></td>");
      if (element.label) {
        label.append($("<strong>" + element.label + "</strong>"))
      }
      var td = $("<td></td>");
      this.likertObjects[element.name].render(td);
      table.append($("<tr></tr>").append(label, td));
    } else if (element.type === "long_text") {
      table.append($("<tr><td id='labeltd' style='vertical-align:top; padding-top:" + $('#feedback').css('margin-top') + "'><strong>" + element.label + "</strong></td><td><textarea name='" + element.name + "' id='" + element.name + "'></textarea></td></tr>"));
    } else if (element.type === "date") {
      table.append($("<tr><td><strong>" + element.label + "</strong></td><td><input type='date' id='" + element.name + "' /></td></tr>"));
    } else if (element.type === "checkbox") {
      table.append($("<tr><td><strong>" + element.label + "</strong></td><td><input type='checkbox' id='" + element.name + "' name='" + element.name + "_response' value='checked' style='margin-top: -16px;' /></td></tr>"));
    } else if (element.type === "toggle") {
      var slider = $("<select data-role='slider' id='" + element.name + "'/>");
      for (var j = 0; j < element.response.length; ++j) {
        slider.append($("<option value='" + element.response[j].value + "'" + (element.response[j].selected===true?" selected=''":"") + ">" + element.response[j].label + "</option>"));
      }
      table.append($("<tr></tr>").append($("<td><strong>" + element.label + "</strong></td>"), $("<td></td>").append(slider)));
    }
  }
  return table;
};

/**
 * Renders the page. This function might be called multiple times (depending on whether navigation is allowed and on the user behaviour)
 * @param {Object} _parent JQuery element which represent the parent DOM element where the content of the page must be stored.
 */
Page.prototype.render = function(_parent) {
  var table = this.renderQuestionnaire(this.pageConfig.questionnaire);
  _parent.append(table);
};

Page.prototype.checkQuestionnaireCompletion = function(_questionnaireConfig) {
  var counter = 0;
  for (var i = 0; i < _questionnaireConfig.length; ++i) {
    var element = _questionnaireConfig[i];
    if (["text", "number", "long_text", "date", "toggle"].includes(element.type)) {
      if ($("#" + element.name).val() || element.optional == true) {
        ++counter;
      }
    } else if (["likert", "checkbox"].includes(element.type)) {
      if ($("input[name='" + element.name + "_response']:checked").val() || element.optional == true) {
        ++counter;
      }
    }
  }
  return counter === _questionnaireConfig.length;
};

Page.prototype.restoreQuestionnaire = function(_questionnaireConfig, _storageObject) {
  for (var i = 0; i < _questionnaireConfig.length; ++i) {
    var element = _questionnaireConfig[i];
    var response = _storageObject[element.name];
    if (response !== undefined) {
      if (["text", "number", "long_text", "date"].includes(element.type)) {
        $("#" + element.name).val(response);
      } else if (element.type === "likert") {
        $("input[name='" + element.name + "_response'][value='" + response + "']").prop("checked", true).checkboxradio("refresh");
        this.likertObjects[element.name].group.change();
      } else if (element.type === "toggle") {
        $('#'+element.name).val(response).slider( "refresh" );
      } else if (element.type === "checkbox") {
        $('#'+element.name).prop('checked', response).checkboxradio('refresh');
      }
    }
  }
};

/**
 * This method is called after the page is rendered. The purpose of this method is to load default values or saved values of the input controls. 
 */
Page.prototype.load = function() {
  if (this.pageConfig.questionnaire.length > 0) {
    this.pageTemplateRenderer.lockNextButton();
    this.restoreQuestionnaire(this.pageConfig.questionnaire, this.questionnaireResponses);
    this.interval = setInterval(function() {
      var complete = this.checkQuestionnaireCompletion(this.pageConfig.questionnaire);
      if (complete) {
        this.pageTemplateRenderer.unlockNextButton();
        $('#send_results').removeAttr('disabled');
      } else {
        this.pageTemplateRenderer.lockNextButton();
      // } else if (i + 1 == this.pageConfig.questionnaire.length && counter != this.pageConfig.questionnaire.length && $('#send_results').is(':enabled')) {
        $('#send_results').prop('disabled', true);
      }
    }.bind(this), 50);
  }
};

Page.prototype.readQuestionnaire = function(_questionnaireConfig, _storageObject) {
  for (var i = 0; i < _questionnaireConfig.length; ++i) {
    var element = _questionnaireConfig[i];
    
    if(element.type === "likert") {
      _storageObject[element.name] = $("input[name='"+element.name + "_response']:checked").val();
    } else if (element.type === "checkbox") {
      _storageObject[element.name] = $("#" + element.name).prop("checked");
    } else {
      _storageObject[element.name] = $("#" + element.name).val();
    }
  }
};

/**
 * This method is called just before the next page is presented to the user. In case values of input controls are needed for rerendering, they must be saved within in method. 
 */
Page.prototype.save = function() {
  clearInterval(this.interval);
  this.readQuestionnaire(this.pageConfig.questionnaire, this.questionnaireResponses);
};

/**
 * @param {Object} _questionnaireStorage
 * @param {Object} _dataContainer
 */
Page.prototype.store = function(_questionnaireStorage, _dataContainer) {
  if (_questionnaireStorage !== undefined) {
    Object.assign(_questionnaireStorage, this.questionnaireResponses);
  }
  if (this.pageConfig.sendDirect === true && _dataContainer !== undefined) {
    this.sendError = this.dataSender.send(this.session);
    if (this.sendError === false) {
      // clear successfully sent data to avoid sending multiple times
      if (Array.isArray(_dataContainer)) {
        _dataContainer.length = 0;
      } else {
        for (var prop in _dataContainer) {
          delete _dataContainer[prop];
        }
      }
    }
  }
};
