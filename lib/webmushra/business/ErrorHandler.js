/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

function ErrorHandler() {
  this.errors = []; 
}

ErrorHandler.prototype.sendError = function(_message) {
  this.errors[this.errors.length] = _message;  
  console.log("ERROR: " + _message);
};


ErrorHandler.prototype.errorOccurred = function() {
  return (this.errors.length > 0);
};

ErrorHandler.prototype.displayErrors = function() {
  var ul = $("<ul style='text-align:left;'></ul>");
  $('#popupErrorsContent').append(ul);
  for (var i = 0; i < this.errors.length; ++i) {
    ul.append($('<li>' + this.errors[i] + '</li>'));
  }
  $("#popupErrors").popup("open");
};

