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
 */
Page.prototype.init = function() {
  for (var i = 0; i < this.pageConfig.questionnaire.length; ++i) {
    var element = this.pageConfig.questionnaire[i];
    if (element.type === "likert") {
      this.likertObjects[element.name] = new LikertScale(element.response, element.name, this.pageConfig.mustPlayback);
    }
  }
};

Page.prototype.renderQuestionnaire = function(_questionnaireConfig, prefix) {
  if (prefix === undefined) {
    prefix = "";
  }
  var table = $("<table align='center'></table>");
  
  for (var i = 0; i < _questionnaireConfig.length; ++i) {
    var element = _questionnaireConfig[i];
    var name = prefix + element.name;
    var label = $("<td></td>");
    if (element.label) {
      label.append($("<strong>" + element.label + "</strong>"))
    }
    var widget = $("<td></td>");
    table.append($("<tr></tr>").append(label, widget));
    if (element.type === "text") {
      widget.append($("<input type='text' id='" + name + "' />"));
    } else if (element.type === "number") {
      widget.append($("<input id='" + name + "' min='" + element.min + "' max='" + element.max + "' value='" + element.default + "' data-inline='true'/>"));
    } else if (element.type === "long_text") {
      label.attr("id", "labeltd");
      label.attr("style", "vertical-align:top");
      widget.append($("<textarea name='" + name + "' id='" + name + "'></textarea>"));
    } else if (element.type === "date") {
      widget.append($("<input type='date' id='" + name + "' />"));
    } else if (element.type === "likert") {
      this.likertObjects[name].render(widget);
    } else if (element.type === "checkbox") {
      widget.append($("<input type='checkbox' id='" + name + "' name='" + name + "_response' value='checked' style='margin-top: -16px;' />"));
    } else if (element.type === "toggle") {
      var slider = $("<select data-role='slider' id='" + name + "'/>");
      for (var j = 0; j < element.response.length; ++j) {
        slider.append($("<option value='" + element.response[j].value + "'" + (element.response[j].selected===true?" selected=''":"") + ">" + element.response[j].label + "</option>"));
      }
      widget.append(slider);
    }
    if (element.type !== "likert" && this.pageConfig.mustPlayback) {
      widget.children().prop("disabled", true);
    }
  }
  return table;
};

Page.prototype.enableQuestionnaire = function(_questionnaireConfig, prefix) {
  if (prefix === undefined) {
    prefix = "";
  }
  for (i = 0; i < _questionnaireConfig.length; ++i) {
    var element = _questionnaireConfig[i];
    var name = prefix + element.name;
    if (["text", "number", "long_text", "date"].includes(element.type)) {
      $("#" + name).textinput("enable");
    } else if (element.type === "likert") {
      this.likertObjects[name].enable();
    } else if (element.type === "checkbox") {
      $("#" + name).checkboxradio("enable");
      // workaround because statement above still leaves parent <div> disabled
      $("#" + name).parent().removeClass("ui-state-disabled");
    } else if (element.type === "toggle") {
      $("#" + name).slider("enable");
    }
  }
}

/**
 * Renders the page. This function might be called multiple times (depending on whether navigation is allowed and on the user behaviour)
 * @param {Object} _parent JQuery element which represent the parent DOM element where the content of the page must be stored.
 */
Page.prototype.render = function(_parent) {
  var table = this.renderQuestionnaire(this.pageConfig.questionnaire);
  _parent.append(table);
};

Page.prototype.checkQuestionnaireCompletion = function(_questionnaireConfig, prefix) {
  if (prefix === undefined) {
    prefix = "";
  }
  var counter = 0;
  for (var i = 0; i < _questionnaireConfig.length; ++i) {
    var element = _questionnaireConfig[i];
    var name = prefix + element.name;
    if (["text", "number", "long_text", "date", "toggle"].includes(element.type)) {
      if ($("#" + name).val() || element.optional == true) {
        ++counter;
      }
    } else if (["likert", "checkbox"].includes(element.type)) {
      if ($("input[name='" + name + "_response']:checked").val() || element.optional == true) {
        ++counter;
      }
    }
  }
  return counter === _questionnaireConfig.length;
};

Page.prototype.restoreQuestionnaire = function(_questionnaireConfig, _storageObject, prefix) {
  if (prefix === undefined) {
    prefix = "";
  }
  for (var i = 0; i < _questionnaireConfig.length; ++i) {
    var element = _questionnaireConfig[i];
    var response = _storageObject[element.name];
    var name = prefix + element.name;
    if (response !== undefined) {
      if (["text", "number", "long_text", "date"].includes(element.type)) {
        $("#" + name).val(response);
      } else if (element.type === "likert") {
        $("input[name='" + name + "_response'][value='" + response + "']").prop("checked", true).checkboxradio("refresh");
        this.likertObjects[name].group.change();
      } else if (element.type === "toggle") {
        $('#'+name).val(response).slider( "refresh" );
      } else if (element.type === "checkbox") {
        $('#'+name).prop('checked', response).checkboxradio('refresh');
      }
    }
  }
};

/**
 * This method is called after the page is rendered. The purpose of this method is to load default values or saved values of the input controls. 
 */
Page.prototype.load = function(_additionalQuestionnnaires) {
  $('#labeltd').css('padding-top', $("#feedback").css("margin-top")); 
  if (this.pageConfig.questionnaire.length > 0) {
    this.pageTemplateRenderer.lockNextButton();
    this.restoreQuestionnaire(this.pageConfig.questionnaire, this.questionnaireResponses);
    this.interval = setInterval(function() {
      var complete = this.checkQuestionnaireCompletion(this.pageConfig.questionnaire);
      if (_additionalQuestionnnaires !== undefined) {
        for (var i = 0; i < _additionalQuestionnnaires.length; ++i) {
          var q = _additionalQuestionnnaires[i];
          complete = complete && this.checkQuestionnaireCompletion(q[0], q[1]);
        }
      }
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

Page.prototype.readQuestionnaire = function(_questionnaireConfig, _storageObject, prefix) {
  if (prefix === undefined) {
    prefix = "";
  }
  for (var i = 0; i < _questionnaireConfig.length; ++i) {
    var element = _questionnaireConfig[i];
    var name = prefix + element.name;
    if(element.type === "likert") {
      _storageObject[element.name] = $("input[name='"+ name + "_response']:checked").val();
    } else if (element.type === "checkbox") {
      _storageObject[element.name] = $("#" + name).prop("checked");
    } else {
      _storageObject[element.name] = $("#" + name).val();
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
