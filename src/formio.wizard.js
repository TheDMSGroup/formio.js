'use strict';
import Promise from "native-promise-only";
import FormioForm from './formio.form';
import Formio from './formio';
import each from 'lodash/each';
import clone from 'lodash/clone';
import jsonLogic from 'json-logic-js';
export class FormioWizard extends FormioForm {
  constructor(element, options) {
    super(element, options);
    this.pages = [];
    this.page = 0;
    this.history = [];
    this.allComponents = {};
    this._nextPage = 1;
    this.buttons = [];
    this.wizardNav = false;
  }

  setPage(num) {
    if (num >= 0 && num < this.pages.length) {
      this.page = num;
<<<<<<< HEAD
      this.buttons = [];
      let page = this.currentPage();
      this.buttons = page.buttons;
      return super.setForm(this.currentPage());
=======
      return super.setForm(this.currentPage()).then(() => {
        // Save the components for when we finally submit.
        this.allComponents[this.page] = clone(this.components);
      });
>>>>>>> 75e856fc958c0c7e19823d64f44a4a3420661f6b
    }
    return Promise.reject('Page not found');
  }

  getNextPage(data, currentPage) {
    let form = this.pages[currentPage];
    // Check conditional nextPage
    if (form) {
      let page = ++currentPage;
      if(form.nextPage) {
        // Allow for script execution.
        if (typeof form.nextPage === 'string') {
          try {
            eval(form.nextPage.toString());
            if (!isNaN(parseInt(page, 10)) && isFinite(page)) {
              return page;
            }
            if (typeof page !== 'string') {
              return page;
            }

            // Assume they passed back the key of the page to go to.
            return this.getPageIndexByKey(page);
          }
          catch (e) {
            console.warn('An error occurred in a custom nextPage function statement for component ' + form.key, e);
            return page;
          }
        }
        // Or use JSON Logic.
        else {
          let result = jsonLogic.apply(form.nextPage, {
            data: data,
            page: page,
            form: form
          });
          let newPage = parseInt(result, 10);
          if (!isNaN(parseInt(newPage, 10)) && isFinite(newPage)) {
            return newPage;
          }

          return this.getPageIndexByKey(result);
        }
      }

      return page;
    }

    return null;
  }

  getPreviousPage() {
    let prev = this.history.pop();
    if(typeof prev !== 'undefined') {
      return prev;
    }

    return this.page - 1;
  }

  nextPage() {

    // DMS Group
    // Fixes checkbox check-then-uncheck validation bug
    for (var i=0; i < this.components.length; i++) {
        if (this.components[i].type === 'checkbox'
            && this.components[i].component.validate.required
            && (this.components[i].value === null || !this.components[i].value)) {

            delete this.submission.data[this.components[i].component.key];
        }
        i++;
    }

    // Validate the form before go to the next page
    if (this.checkValidity(this.submission.data, true)) {
<<<<<<< HEAD
      if (this.beforeNextPageCallback) {
        this.beforeNextPageCallback(this, this.submission.data, this.nextPageWithValidation);
      } else {
        let currentPage = this.page;
        let nextPage = this.getCondionalNextPage(this.submission.data, currentPage);

        return this.setPage(nextPage).then(() => {
          this.historyPages[this.page] = currentPage;
          this._nextPage = this.getCondionalNextPage(this.submission.data, this.page);
          this.emit('nextPage', {page: this.page, submission: this.submission});
        });
      }
=======
      this.checkData(this.submission.data, true);
      return this.beforeNext().then(() => {
        this.history.push(this.page);
        return this.setPage(this.getNextPage(this.submission.data, this.page)).then(() => {
          this._nextPage = this.getNextPage(this.submission.data, this.page);
          this.emit('nextPage', {page: this.page, submission: this.submission});
        });
      });
>>>>>>> 75e856fc958c0c7e19823d64f44a4a3420661f6b
    }
    else {
      return Promise.reject(this.showErrors());
    }
  }

  nextPageWithValidation(thisInstance, valid, message) {
    let proceedToNextPage = false;

    // If no data given, then proceed to the next page.
    if (typeof valid === 'undefined' && typeof message === 'undefined') {
      proceedToNextPage = true;
    }

    // If data was given and the valid flag is true.
    if (valid) {
      proceedToNextPage = true;
    }

    if (proceedToNextPage) {
        let currentPage = thisInstance.page;
        let nextPage = thisInstance.getCondionalNextPage(thisInstance.submission.data, currentPage);

        return thisInstance.setPage(nextPage).then(() => {
          thisInstance.historyPages[thisInstance.page] = currentPage;
          thisInstance._nextPage = thisInstance.getCondionalNextPage(thisInstance.submission.data, thisInstance.page);
          thisInstance.emit('nextPage', {page: thisInstance.page, submission: thisInstance.submission});
        });
    } else {
      return Promise.reject(
        thisInstance.showErrors(message)
      );
    }
  }

  prevPage() {
    let prevPage = this.getPreviousPage();
    return this.setPage(prevPage).then(() => {
      this.emit('prevPage', {page: this.page, submission: this.submission});
    });
  }

  cancel() {
    super.cancel();
    this.history = [];
    return this.setPage(0);
  }

  getPageIndexByKey(key) {
    let pageIndex = 0;
    each(this.pages, (_page, index) => {
      if (_page.key === key) {
        pageIndex = index;
        return false;
      }
    });
    return pageIndex;
  }

  getPage(pageNum) {
    if ((pageNum >= 0) && (pageNum < this.pages.length)) {
      return this.pages[pageNum];
    }
    return this.pages.length ? this.pages[0] : {components: []};
  }

  currentPage() {
    return this.getPage(this.page);
  }

  setForm(form) {
    this.pages = [];
    this.wizardNav = false;
    if (form.enableNavigation) {
      this.wizardNav = true;
    }
    each(form.components, (component) => {
      if (component.type === 'panel') {
        this.pages.push(component);
      }
      else if (component.key) {
        this.allComponents[component.key] = this.addComponent(component, this.element, this.data);
      }
    });
    return this.setPage(this.page);
  }
  build() {
    this.createWizardHeader();
    super.build();
    this.createWizardNav();
  }

  hasButton(name) {
    if (name === 'previous') {
      return (this.page > 0);
    }
    let nextPage = this.getNextPage(this.submission.data, this.page);
    if (name === 'next') {
      return (nextPage !== null) && (nextPage < this.pages.length);
    }
    if (name === 'submit') {
      return (nextPage === null) || (this.page === (this.pages.length - 1));
    }
    return true;
  }

  createWizardHeader() {
<<<<<<< HEAD
    if (!this.wizardNav) {
      return;
    }
    
=======
    let currentPage = this.currentPage();
    currentPage.breadcrumb = currentPage.breadcrumb || 'default';
    if (currentPage.breadcrumb.toLowerCase() === 'none') {
      return;
    }
>>>>>>> 75e856fc958c0c7e19823d64f44a4a3420661f6b
    this.wizardHeader = this.ce('wizardHeader', 'ul', {
      class: 'pagination'
    });

    let showHistory = (currentPage.breadcrumb.toLowerCase() === 'history');
    each(this.pages, (page, i) => {
      // See if this page is in our history.
      if (showHistory && ((this.page !== i) && (this.history.indexOf(i) === -1))) {
        return;
      }

      let pageButton = this.ce('pageButton', 'li', {
        class: (i === this.page) ? 'active' : '',
        style: (i === this.page) ? '' : 'cursor: pointer;'
      });

      // Navigate to the page as they click on it.
      if (this.page !== i) {
        this.addEventListener(pageButton, 'click', (event) => {
          event.preventDefault();
          this.setPage(i);
        });
      }

      let pageLabel = this.ce('pageLabel', 'span');
      let pageTitle = ((i === this.page) || showHistory) ? page.title : (i + 1);
      if (!pageTitle) {
        pageTitle = (i + 1);
      }
      pageLabel.appendChild(this.text(pageTitle));
      pageButton.appendChild(pageLabel);
      this.wizardHeader.appendChild(pageButton);
    });

    this.element.appendChild(this.wizardHeader);
  }

  onSubmissionChange(changed) {
    super.onSubmissionChange(changed);

    // Update Wizard Nav
    let nextPage = this.getNextPage(this.submission.data, this.page);
    if (this._nextPage != nextPage) {
      this.element.removeChild(this.wizardNav);
      this.createWizardNav();
      this.emit('updateWizardNav', {oldpage: this._nextPage, newpage: nextPage, submission: this.submission});
      this._nextPage = nextPage;
    }
  }

  createWizardNav() {
    this.wizardNav = this.ce('wizardNav', 'ul', {
      class: 'list-inline'
    });
    if (this.buttons) {
      each(this.buttons, (button) => {
        if (!this.hasButton(button.name)) {
          return;
        }
        let buttonWrapper = this.ce('wizardNavButton', 'li');
        let buttonProp = button.name + 'Button';
        this[buttonProp] = this.ce(buttonProp, 'button', {
          class: button.class
        });
        if (button.custom) {
          this[buttonProp].appendChild(this.text(this.t(button.custom)));
        } else {
          this[buttonProp].appendChild(this.text(this.t(button.name)));
        }
        this.addEventListener(this[buttonProp], 'click', (event) => {
          event.preventDefault();
          this[button.method]();
        });
        buttonWrapper.appendChild(this[buttonProp]);
        this.wizardNav.appendChild(buttonWrapper);
      });
    } else {
      each([
        {name: 'cancel',    method: 'cancel',   class: 'btn btn-default'},
        {name: 'previous',  method: 'prevPage', class: 'btn btn-primary'},
        {name: 'next',      method: 'nextPage', class: 'btn btn-primary'},
        {name: 'submit',    method: 'submit',   class: 'btn btn-primary'}
      ], (button) => {
        if (!this.hasButton(button.name)) {
          return;
        }
        let buttonWrapper = this.ce('wizardNavButton', 'li');
        let buttonProp = button.name + 'Button';
        this[buttonProp] = this.ce(buttonProp, 'button', {
          class: button.class
        });
        this[buttonProp].appendChild(this.text(this.t(button.name)));
        this.addEventListener(this[buttonProp], 'click', (event) => {
          event.preventDefault();
          this[button.method]();
        });
        buttonWrapper.appendChild(this[buttonProp]);
        this.wizardNav.appendChild(buttonWrapper);
      });
    }
    // Add the wizard navigation
    this.element.appendChild(this.wizardNav);
  }

  getComponents() {
    // Set the components based on all components.
    let components = [];
    each(this.allComponents, (comps) => {
      components = components.concat(comps);
    });
    return components;
  }
}

FormioWizard.setBaseUrl = Formio.setBaseUrl;
FormioWizard.setApiUrl = Formio.setApiUrl;
FormioWizard.setAppUrl = Formio.setAppUrl;

module.exports = global.FormioWizard = FormioWizard;
