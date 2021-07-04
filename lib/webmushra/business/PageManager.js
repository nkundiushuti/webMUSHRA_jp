/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

function PageManager (_variableName, _htmlParenElementId, _localizer, _errorHandler, _stopOnErrors) {
    this.pages = [];
    this.pagesIndex = -1;
    this.parentElementId = _htmlParenElementId;
    this.varName = _variableName;
    this.callbacksPageEventChanged = [];
    this.localizer = _localizer;
    this.errorHandler = _errorHandler;
    this.stopOnErrors = _stopOnErrors;
}

PageManager.prototype.addCallbackPageEventChanged = function (_callback) {
    this.callbacksPageEventChanged[this.callbacksPageEventChanged.length] = _callback;
};

PageManager.prototype.insertPage = function (_page, _index) {
  this.pages.splice(_index, 0, _page);
};

PageManager.prototype.getNextPage = function () {
  return this.pages[this.pagesIndex+1];
};

PageManager.prototype.getPageIndex = function () {
  return this.pagesIndex;
};

PageManager.prototype.getNumPages = function () {
  return this.pages.length;
};

PageManager.prototype.getPage = function (_index) {
  return this.pages[_index];
};

PageManager.prototype.getCurrentPage = function () {
  return this.pages[this.pagesIndex];
};

PageManager.prototype.loadPage = function () {
  var id = this.parentElementId;
  $("#"+id).empty();
  this.pages[this.pagesIndex].render($("#"+id));
  this.pageEventChanged();
  $("#"+id).append($("<script> " + this.getPageVariableName(this.getCurrentPage()) + ".load();</script>"));
  window.scrollTo(0, 0);
  if (this.stopOnErrors && this.errorHandler.errorOccurred()) {
    this.errorHandler.displayErrors();
  } else {
    $("body").children().children().removeClass('ui-disabled');
  }
  $.mobile.loading("hide");
};

PageManager.prototype.nextPage = function () {
  if (this.pagesIndex > -1) {
    this.pages[this.pagesIndex].save();
    this.pages[this.pagesIndex].store();
  }
  ++this.pagesIndex;
  if (this.pagesIndex < this.pages.length) {
    this.pages[this.pagesIndex].init();
    if (this.pages[this.pagesIndex].loadAudioFiles !== undefined) {
      this.pages[this.pagesIndex].loadAudioFiles(this.loadPage.bind(this));
    } else {
      this.loadPage();
    };
  } else {
    --this.pagesIndex;
    if (this.stopOnErrors && this.errorHandler.errorOccurred()) {
      this.errorHandler.displayErrors();
    }
  }
};

PageManager.prototype.previousPage = function () {
    --this.pagesIndex;
    if (this.pagesIndex <= this.pages.length) {
      if (this.pages[this.pagesIndex + 1] !== null && this.pages[this.pagesIndex + 1].save !== null) {
        this.pages[this.pagesIndex + 1].save();
      }
      var id = this.parentElementId;
      $("#"+id).empty();
      this.pages[this.pagesIndex].render($("#"+id));
      this.pageEventChanged();
      $("#"+id).append($("<script> " + this.getPageVariableName(this.getCurrentPage()) + ".load();</script>"));
      window.scrollTo(0, 0);
    } else {
      ++this.pagesIndex;
    }
};

PageManager.prototype.start = function () {
    this.nextPage();
};

PageManager.prototype.restart = function () {
    this.pagesIndex = -1;
    this.start();
};

PageManager.prototype.getPageVariableName = function (_page) {
    for (var i = 0; i < this.pages.length; ++i) {
        if (this.pages[i] == _page) {
            return this.varName + ".pages[" + i +"]";
        }
    }
    return false;
};

PageManager.prototype.getPageManagerVariableName = function () {
    return this.varName;
};

PageManager.prototype.pageEventChanged = function () {
    for (var i = 0; i < this.callbacksPageEventChanged.length; ++i) {
      this.callbacksPageEventChanged[i]();
    }
};

PageManager.prototype.getLocalizer = function () {
  return this.localizer;
};
