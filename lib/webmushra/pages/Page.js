/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

function Page(_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language) {
  this.pageManager = _pageManager;
  this.pageTemplateRenderer = _pageTemplateRenderer;
  this.pageConfig = _pageConfig;
  this.session = _session;
  this.language = _language;
  if (this.pageConfig.questionnaire === undefined) {
    this.pageConfig.questionnaire = [];
  }
  this.questionnaireResponses = {};
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
};

/**
 * Renders the page. This function might be called multiple times (depending on whether navigation is allowed and on the user behaviour)
 * @param {Object} _parent JQuery element which represent the parent DOM element where the content of the page must be stored.
 */
Page.prototype.render = function(_parent) {
  var table = $("<table align='center'></table>");
  _parent.append(table);

  var i;
  for (i = 0; i < this.pageConfig.questionnaire.length; ++i) {
    var element = this.pageConfig.questionnaire[i];
    if (element.type === "text") {
      table.append($("<tr><td><strong>" + element.label + "</strong></td><td><input id='" + element.name + "' /></td></tr>"));
    } else if (element.type === "number") {
      table.append($("<tr><td><strong>" + element.label + "</strong></td><td><input id='" + element.name + "' min='" + element.min + "' max='" + element.max + "' value='" + element.default + "' data-inline='true'/></td></tr>"));
    } else if (element.type === "likert") {
      var likert = new LikertScale(element.response, element.name + "_");
      var td = $("<td></td>");
      table.append($("<tr></tr>").append(
        $("<td><strong>" + element.label + "</strong></td>"),
        td
      ));
      likert.render(td);
    } else if (element.type === "long_text") {
      table.append($("<tr><td id='labeltd' style='vertical-align:top; padding-top:" + $('#feedback').css('margin-top') + "'><strong>" + element.label + "</strong></td><td><textarea name='" + element.name + "' id='" + element.name + "'></textarea></td></tr>"));
    }
  }
};

/**
 * This method is called after the page is rendered. The purpose of this method is to load default values or saved values of the input controls. 
 */
Page.prototype.load = function() {
  if (this.pageConfig.questionnaire.length > 0) {
    this.pageTemplateRenderer.lockNextButton();
    this.interval = setInterval((function() {
      var counter = 0;
      var i;
      for (i = 0; i < this.pageConfig.questionnaire.length; ++i) {
        var element = this.pageConfig.questionnaire[i];
        if (element.type === "text") {
          if ($("#" + element.name).val() || element.optional == true) {
            ++counter;
          }
        } else if (element.type === "number") {
          if ($("#" + element.name).val() || element.optional == true) {
            ++counter;
          }
        } else if (element.type === "likert") {
          if ($("input[name='" + element.name + "__response']:checked").val() || element.optional == true) {
            ++counter;
          }
        } else if (element.type === "long_text") {
          if ($("#" + element.name).val() || element.optional == true) {
            ++counter;
          }
        }
      }
      if (counter == this.pageConfig.questionnaire.length) {
        this.pageTemplateRenderer.unlockNextButton();
        $('#send_results').removeAttr('disabled');
      } else {
        this.pageTemplateRenderer.lockNextButton();
      // } else if (i + 1 == this.pageConfig.questionnaire.length && counter != this.pageConfig.questionnaire.length && $('#send_results').is(':enabled')) {
        $('#send_results').attr('disabled', true);
      }
    }).
      bind(this), 50);
  }
};

/**
 * This method is called just before the next page is presented to the user. In case values of input controls are needed for rerendering, they must be saved within in method. 
 */
Page.prototype.save = function() {
  clearInterval(this.interval);
  for (var i = 0; i < this.pageConfig.questionnaire.length; ++i) {
    var element = this.pageConfig.questionnaire[i];
    
    if($("#" + element.name).val()){
      this.questionnaireResponses[element.name] = $("#" + element.name).val(); 
    } else { 
      this.questionnaireResponses[element.name] = $("input[name='"+element.name + "__response']:checked").val();
    }
  }
};

/**
 * @param {ResponsesStorage} _reponsesStorage
 */
Page.prototype.store = function(_reponsesStorage) {
  if (_reponsesStorage !== undefined) {
    Object.assign(_reponsesStorage, this.questionnaireResponses);
  }
};
