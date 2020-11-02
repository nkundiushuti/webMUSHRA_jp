/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

FinishPage.prototype = Object.create(Page.prototype);
FinishPage.prototype.constructor = FinishPage;

function FinishPage(_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender) {
  Object.getPrototypeOf(FinishPage.prototype).constructor.call(this, _pageManager, _pageTemplateRenderer, _pageConfig, _session, _language);
  this.dataSender = _dataSender;
  this.errorDiv = $("<div style='color:red; font-weight:bold;'></div>");  
}

FinishPage.prototype.sendResults = function() {
  var err = this.dataSender.send(this.session);
  if (err == true) {
    this.errorDiv.text("An error occured while sending your data to the server! Please contact the experimenter.");
  }
};

FinishPage.prototype.render = function (_parent) {
    _parent.append(this.pageConfig.content);

    Object.getPrototypeOf(FinishPage.prototype).render.call(this, _parent);
    var button = $("<button id='send_results' data-role='button' data-inline='true'>" + this.pageManager.getLocalizer().getFragment(this.language, 'sendButton') +"</button>");
    button.bind( "click", (function(event, ui) {
      Object.getPrototypeOf(FinishPage.prototype).save.call(this);
      Object.getPrototypeOf(FinishPage.prototype).store.call(this, this.session.participant);
      this.sendResults();

      $("#popupDialog").popup("open");
    }).bind(this));
    _parent.append(button);
    Mousetrap.bind('enter', function() {if (!button[0].hasAttribute('disabled')) {button.click();}});

    $("#popHeader").text(this.pageManager.getLocalizer().getFragment(this.language, 'attending'));
    
    var table = $("<table align='center'> </table>");
    var trHeader = document.createElement("tr");
    var trT;
    var trRatings ;
    var thSecondContent = $("<th colspan='2' align='center'> </th>");
    
    $(thSecondContent).append(this.pageConfig.popupContent);
    $(table).append(thSecondContent);
    $(table).append(trHeader);

    var thHeader;
    var thT;
    var tdRatingStimulus;
    var tdRatingScore;
    if (this.pageConfig.showResults) {
      th = $("<th colspan='3'> </th>");
                 
      $(th).append($("<h3>" + this.pageManager.getLocalizer().getFragment(this.language, 'results') + "</h3>"));
      $(trHeader).append(th);

      var trials = this.session.trials;
      for (i = 0; i < trials.length; ++i) {
        var trial = trials[i];
        if (trial.type === "mushra") {
          trT = document.createElement("tr");        
          thT = $("<th colspan='2'></th>");
          $(thT).append(trial.id + " (MUSHRA)" );
          $(trT).append(thT);
          $(table).append(trT);
  
          var ratings = trial.responses;
          for (var j = 0; j < ratings.length; ++j) {
            trRatings = document.createElement("tr");
            tdRatingStimulus = document.createElement("td");
            tdRatingScore = document.createElement("td");
  
            tdRatingStimulus.width = "50%";
            tdRatingScore.width = "50%";
  
            var rating = ratings[j];
  
            $(tdRatingStimulus).append(rating.stimulus + ": ");
            $(tdRatingScore).append(rating.score);
            $(trRatings).append(tdRatingStimulus);
            $(trRatings).append(tdRatingScore);
            $(table).append(trRatings);
             
          }
          trEmpty = $("<tr height='8px'></tr>");
          $(table).append(trEmpty);
        } else if (trial.type === "paired_comparison") {
          
          trPaired = document.createElement("tr"); 
          thT = $("<th colspan='2'></th>");
          $(thT).append(trial.id + " (Paired Comparison)" );
          $(trPaired).append(thT);
          $(table).append(trPaired);
          var j;
          for(j = 0; j < trial.responses.length; ++j){
            trPC = document.createElement("tr"); 
            tdPCReference = document.createElement("td"); 
            tdPCres = document.createElement("td");
            
            var response = trial.responses[j];
            
            
            $(tdPCres).append(response.answer);
            $(tdPCReference).append(response.nonReference);
            $(trPC).append(tdPCReference);
            $(trPC).append(tdPCres); 
            $(table).append(trPC);
          }
          trEmpty = $("<tr height='8px'></tr>");
            $(table).append(trEmpty);
         
        } else if(trial.type ==="bs1116") {
          trPaired = document.createElement("tr"); 
          thT = $("<th colspan='2'></th>");
          $(thT).append(trial.id + " (BS1116)" );
          $(trPaired).append(thT);
          $(table).append(trPaired);
          
          var j;
          for(j = 0; j < trial.responses.length; ++j){
            var response = trial.responses[j];
            
            
            trBS1 = document.createElement("tr"); 
            trBS2 = document.createElement("tr");
            tdBSReference = document.createElement("td"); 
            tdBSRefValue = document.createElement("td"); 
            tdBSCondition = document.createElement("td");
            tdBSConValue = document.createElement("td");
            
            $(tdBSReference).append(response.reference + ": ");
            $(tdBSRefValue).append(response.referenceScore);
            $(trBS1).append(tdBSReference);
            $(trBS1).append(tdBSRefValue);
            
            $(tdBSCondition).append(response.nonReference + ": ");
            $(tdBSConValue).append(response.nonReferenceScore);
            $(trBS2).append(tdBSCondition);
            $(trBS2).append(tdBSConValue);
            
            trEmpty = $("<tr height='5px'></tr>");

            $(table).append(trBS1);
            $(table).append(trBS2);
            $(table).append(trEmpty);
          }
          trEmpty = $("<tr height='3px'></tr>");
          $(table).append(trEmpty);
        } else if( trial.type === "likert_multi_stimulus"){
          trLMSH = document.createElement("tr"); 
          thT = $("<th colspan='2'></th>");
          $(thT).append(trial.id + " (LMS)" );
          $(trLMSH).append(thT);
          $(table).append(trLMSH);
          var j;
          for(j = 0; j < trial.responses.length; ++j){
            trLMS = document.createElement("tr");
            
            tdStimulus = document.createElement("td");
            tdRating = document.createElement("td");
            
            $(tdStimulus).append(trial.responses[j].stimulus + ": ");
            $(tdRating).append(trial.responses[j].stimulusRating);
            
            $(trLMS).append(tdStimulus);
            $(trLMS).append(tdRating);
            
            $(table).append(trLMS);
            
          }
        } else if(trial.type === "likert_single_stimulus"){
          trLSSH = document.createElement("tr"); 
          thT = $("<th colspan='2'></th>");
          $(thT).append(trial.id + " (LSS)" );
          $(trLSSH).append(thT);
          $(table).append(trLSSH);
          
          var j;
          for(j = 0; j < trial.responses.length; ++j){
            trLSS = document.createElement("tr");
            
            tdStimuli = document.createElement("td");
            tdRating = document.createElement("td");
            
            $(tdStimuli).append(trial.responses[j].stimulus + ": ");
            var allRatings = [];
            for (var prop in trial.responses[j].stimulusRating) {
              allRatings.push(trial.responses[j].stimulusRating[prop]);
            }
            $(tdRating).append(allRatings.join(", "));
            
            $(trLSS).append(tdStimuli);
            $(trLSS).append(tdRating);
            
            $(table).append(trLSS);
          }
        }
      }
     }

    if(this.pageConfig.showErrors == true){
          $("#popupResultsContent").append(this.errorDiv);
     }     

    $("#popupResultsContent").append(table);
};

FinishPage.prototype.load = function() {
  $('#labeltd').css('padding-top', $("#feedback").css("margin-top"));
  Object.getPrototypeOf(FinishPage.prototype).load.call(this);
};
