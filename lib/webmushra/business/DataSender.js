/*************************************************************************
         (C) Copyright AudioLabs 2017

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law.

**************************************************************************/

function DataSender(config, _pageManager, _errorHandler) {
  this.target = config.remoteService;
  this.pageManager = _pageManager;
  this.errorHandler = _errorHandler;
}

DataSender.prototype.send = function(_session) {
  var sessionJSON = JSON.stringify(_session);
  var httpReq = new XMLHttpRequest();
  try {
    httpReq.open("POST", config.remoteService, false);  // synchron
    httpReq.setRequestHeader("Content-type", "application/json");
    httpReq.send(sessionJSON);
  }
  catch (e) {
    return true;
  }
  var responseJson = JSON.parse(httpReq.responseText);
  if (responseJson !== null) {
    if ('error' in responseJson) {
      this.errorHandler.sendError(responseJson['error']);
      return true;
    }
    if ('pages' in responseJson) {
      addPagesToPageManager(this.pageManager, responseJson['pages'], this.pageManager.getPageIndex()+1);
    }
    if('pagesIndex' in responseJson) {
      this.pageManager.pagesIndex = responseJson['pagesIndex'];
    }
  }
  if (httpReq.status == 200) {
    return false;
  } else {
    return true;
  }
};
