/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

GenericPage.prototype = Object.create(Page.prototype);
GenericPage.prototype.constructor = GenericPage;

/**
* @class GenericPage
* @property {string} title the page title
* @property {string} the page content
*/
function GenericPage(_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language) {
  Object.getPrototypeOf(GenericPage.prototype).constructor.call(this, _pageManager, _pageTemplateRenderer, _pageConfig, _session, _language);
}

/**
* Renders the page
* @memberof GenericPage
*/
GenericPage.prototype.render = function (_parent) {
  _parent.append(this.pageConfig.content);
  Object.getPrototypeOf(GenericPage.prototype).render.call(this, _parent);
};

GenericPage.prototype.store = function () {
  Object.getPrototypeOf(GenericPage.prototype).store.call(this, this.session.participant);
};
