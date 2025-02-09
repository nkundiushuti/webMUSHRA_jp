/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

MushraAudioControlInputController.prototype = Object.create(InputController.prototype);
MushraAudioControlInputController.prototype.constructor = MushraAudioControlInputController;


function MushraAudioControlInputController(_mushraAudioControl, _looping) {
  Object.getPrototypeOf(MushraAudioControlInputController.prototype).constructor.call(this, _mushraAudioControl, _looping);
}


MushraAudioControlInputController.prototype.bind = function() {

  var conditions = this.audioControl.getConditions();
  Mousetrap.bind(['r', '0'], function() { $('#buttonReference').click(); });
  Mousetrap.bind(['backspace'], function() { $('#buttonStop').click(); });
  Mousetrap.bind(['space'], (function() {   var firstPageCall = false;                                         
                                            for(var j = 0; j < conditions.length; j++) {
                                              if($('#buttonConditions' + j).attr('active') == 'true') {                                               
                                                if(this.audioControl.audioPlaying != true) {
                                                  this.audioControl.setPosition(this.audioControl.audioLoopStart);   
                                                }
                                                $('#buttonConditions' + j).click();
                                                firstPageCall = false;
                                                break;
                                              } else if($('#buttonReference').attr('active') == 'true') {                                             
                                                if(this.audioControl.audioPlaying != true) {
                                                  this.audioControl.setPosition(this.audioControl.audioLoopStart); 
                                                }
                                                $('#buttonReference').click();
                                                firstPageCall = false;
                                                break;                                                
                                              } else {
                                                firstPageCall = true;
                                              }   
                                            }
                                            if(firstPageCall == true) {
                                              $('#buttonReference').click();
                                            }
  }).bind(this));

  var duration = this.audioControl.getDuration();
  if (this.looping) {
    Mousetrap.bind(['a'], function() { this.pageManager.getCurrentPage().setLoopStart(); });
    Mousetrap.bind(['b'], function() { this.pageManager.getCurrentPage().setLoopEnd(); });
    Mousetrap.bind(['B'], (function() { this.audioControl.setLoopEnd(duration); }).bind(this));
    Mousetrap.bind(['A'], (function() { this.audioControl.setLoopStart(0); }).bind(this));
  }

  for (i = 0; i < conditions.length; ++i) {
    (function(i) {
        Mousetrap.bind(String(i + 1), function() { $('#buttonConditions' + i).click(); });
        Mousetrap.bind(['l'], function() {
                         if($('#buttonReference').attr('active') == 'true') {
                            $('#buttonConditions0').click();
                          } else if($('#buttonConditions' + (conditions.length - 1)).attr('active') == 'true') {
                            $('#buttonReference').click();
                          } else {
                            for(var k = 0; k < conditions.length - 1; ++k) {
                              if($('#buttonConditions' + k).attr('active') == 'true') {
                                var next = k + 1;
                                $('#buttonConditions' + next).click();
                                break;
                              }
                            }
                          }
        });
        Mousetrap.bind(['h'], function() {
                          if($('#buttonReference').attr('active') == 'true') {
                            $('#buttonConditions' + (conditions.length - 1)).click();
                          } else if($('#buttonConditions0').attr('active') == 'true') {
                            $('#buttonReference').click();
                          } else {
                            for(var l = 1; l < conditions.length; ++l) {
                              if($('#buttonConditions' + l).attr('active') == 'true') {
                                var previous = l - 1;
                                $('#buttonConditions' + previous).click();
                                break;
                              }
                            }
                          }
        });
        Mousetrap.bind(['up', 'j', 'shift+up', 'shift+j'], function(e, combo) {
                                                addVal = 0;
                                                if (combo.indexOf('shift') != -1 ) {
                                                    addVal = 10;
                                                } else {
                                                    addVal = 1;
                                                }
                                                for(j = 0; j < conditions.length; ++j) {
                                                  var slider = $('.scales').get(j);
                                                  if($(slider).attr('active') == 'true') {

                                                   var newValue = parseInt($(slider).val()) + addVal;
                                                   $(slider).val(newValue.toString());
                                                   $(slider).slider().slider('refresh');
                                                   break;
                                                   }
                                                }
                                        return false;
                                        });

        Mousetrap.bind(['down', 'k', 'shift+down', 'shift+k'], function(e, combo) {
                                                addVal = 0;
                                                if (combo.indexOf('shift') != -1 ) {
                                                    addVal = 10;
                                                } else {
                                                    addVal = 1;
                                                }
                                                for(j = 0; j < conditions.length; ++j) {
                                                  var slider = $('.scales').get(j);
                                                  if($(slider).attr('active') == 'true') {

                                                   var newValue = parseInt($(slider).val()) - addVal;
                                                   $(slider).val(newValue.toString());
                                                   $(slider).slider().slider('refresh');
                                                   break;
                                                  }
                                                }
                                        return false;
                                        });
    })(i);
    Object.getPrototypeOf(MushraAudioControlInputController.prototype).bind.call();
  }

  document.onkeydown = function (event) { 

    if (!event) { /* This will happen in IE */
      event = window.event;
    }

    var keyCode = event.keyCode;

    if (keyCode == 8 && // prevents backspace to go back
      ((event.target || event.srcElement).tagName != "TEXTAREA") &&
      ((event.target || event.srcElement).tagName != "INPUT")) {

      if (navigator.userAgent.toLowerCase().indexOf("msie") == -1) {
        event.stopPropagation();
      } else {
        alert("prevented");
        event.returnValue = false;
      }

      return false;
    } else if (keyCode == 32 && // prevents space bar to scroll down
      ((event.target || event.srcElement).tagName != "TEXTAREA") &&
      ((event.target || event.srcElement).tagName != "INPUT")) { 
        
        if (navigator.userAgent.toLowerCase().indexOf("msie") == -1) {
          event.stopPropagation();
        } else {
          alert("prevented");
          event.returnValue = false;
        }
  
        return false;
      }
  };
  
};


MushraAudioControlInputController.prototype.unbind = function() {
  Object.getPrototypeOf(MushraAudioControlInputController.prototype).unbind.call();
  Mousetrap.unbind(['r', '0', 'a', 'b', 'A', 'B', 'j', 'backspace', 'space', 'k', 'h', 'l', 'up', 'down']);
  var conditions = this.audioControl.getConditions();
  for (i = 0; i < conditions.length; ++i) {
      Mousetrap.unbind(String(i + 1));
  }
};
