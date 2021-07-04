/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

function PairedComparisonPageManager() {
  
}

PairedComparisonPageManager.prototype.createPages = function (_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender, _audioContext, _bufferSize, _audioFileLoader, _errorHandler, _insertIndex) {
  stimuli = [];
  for (var key in _pageConfig.stimuli) {
    stimuli[stimuli.length] = new Stimulus(key, _pageConfig.stimuli[key]);
  }
  var reference = new Stimulus("reference", _pageConfig.reference);
  shuffle(stimuli);
  
  for (var i = 0; i < stimuli.length; ++i) {
  	var page = new PairedComparisonPage(_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender, _audioContext, _bufferSize, _audioFileLoader, _errorHandler, reference, stimuli[i]);
  	_pageManager.insertPage(page, _insertIndex);
    ++_insertIndex;
  }
  return _insertIndex;
};
