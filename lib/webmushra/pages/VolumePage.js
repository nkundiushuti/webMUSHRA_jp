/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

VolumePage.prototype = Object.create(FilePlayerPage.prototype);
VolumePage.prototype.constructor = VolumePage;

function VolumePage(_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender, _audioContext, _bufferSize, _audioFileLoader, _errorHandler) {
  Object.getPrototypeOf(VolumePage.prototype).constructor.call(this, _pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender, _audioContext, _bufferSize, _audioFileLoader, _errorHandler);

  this.stimulus = new Stimulus("stimulus", _pageConfig.stimulus);

  Object.getPrototypeOf(VolumePage.prototype).addAudioFile.call(this, this.pageConfig.stimulus, this.stimulus);
  
  this.audioContext.volume = this.volume = this.pageConfig.defaultVolume; 
}

VolumePage.prototype.init = function () {
  Object.getPrototypeOf(VolumePage.prototype).init.call(this, [this.stimulus], false);
};

VolumePage.prototype.save = function() {
  Object.getPrototypeOf(VolumePage.prototype).save.call(this);
  this.volume = this.audioContext.volume;
};

VolumePage.prototype.store = function() {
  Object.getPrototypeOf(VolumePage.prototype).store.call(this, this.session.participant, this.session.participant);
};

VolumePage.prototype.gainVolume = function(value) {
  this.audioContext.volume = parseInt(value, 10) / 100.0;
};


VolumePage.prototype.render = function (_parent) {
  var content = $(" <p> " + this.pageConfig.content + " </p>");
  var slider = $("<table width='600' style='margin: 0 auto;'></table>");
  slider.append(
    $('<tr></tr>').append(
      $('<td></td>').append(
        $('<input type="range" name="slider"  min="0" max="100" value="'+ this.volume * 100 +'"  data-highlight="true" onchange = "' + this.pageManager.getPageVariableName(this) + '.gainVolume(this.value)">')
      )
    )
  );
  _parent.append(content);
  _parent.append(slider);
  Object.getPrototypeOf(VolumePage.prototype).render.call(this, _parent);
};
