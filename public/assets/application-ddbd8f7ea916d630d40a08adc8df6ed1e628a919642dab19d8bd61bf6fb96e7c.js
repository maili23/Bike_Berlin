/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


;

(function() {
  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(this);

  var Rails = this.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (typeof options.beforeSend === "function") {
          options.beforeSend(xhr, options);
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        } else {
          return fire(document, 'ajaxStop');
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return xhr.abort();
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.0.3
Copyright © 2017 Basecamp, LLC
 */

(function(){(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(e,r){return t.controller.visit(e,r)},clearCache:function(){return t.controller.clearCache()}}}).call(this)}).call(this);var t=this.Turbolinks;(function(){(function(){var e,r,n=[].slice;t.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},t.closest=function(t,r){return e.call(t,r)},e=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),t.defer=function(t){return setTimeout(t,1)},t.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},t.dispatch=function(t,e){var r,n,o,i,s;return i=null!=e?e:{},s=i.target,r=i.cancelable,n=i.data,o=document.createEvent("Events"),o.initEvent(t,!0,r===!0),o.data=null!=n?n:{},(null!=s?s:document).dispatchEvent(o),o},t.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),t.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){t.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.absoluteURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=e(this.requestCanceled,this),this.requestTimedOut=e(this.requestTimedOut,this),this.requestFailed=e(this.requestFailed,this),this.requestLoaded=e(this.requestLoaded,this),this.requestProgressed=e(this.requestProgressed,this),this.url=t.Location.wrap(n).requestURL,this.referrer=t.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return t.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return t.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ProgressBar=function(){function t(){this.trickle=e(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,t.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",t.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},t.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},t.prototype.setValue=function(t){return this.value=t,this.refresh()},t.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},t.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},t.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},t.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},t.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},t.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},t.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},t.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},t.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},t.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=e(this.showProgressBar,this),this.progressBar=new t.ProgressBar}var n,o,i,s;return s=t.HttpRequest,n=s.NETWORK_FAILURE,i=s.TIMEOUT_FAILURE,o=500,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case i:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,o)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.History=function(){function r(t){this.delegate=t,this.onPageLoad=e(this.onPageLoad,this),this.onPopState=e(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(e,r){return e=t.Location.wrap(e),this.update("push",e,r)},r.prototype.replace=function(e,r){return e=t.Location.wrap(e),this.update("replace",e,r)},r.prototype.onPopState=function(e){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=e.state)?n.turbolinks:void 0)?(r=t.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(e){return t.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){t.Snapshot=function(){function e(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return e.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},e.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},e.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},e.prototype.clone=function(){return new e({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},e.prototype.getRootLocation=function(){var e,r;return r=null!=(e=this.getSetting("root"))?e:"/",new t.Location(r)},e.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},e.prototype.hasAnchor=function(t){try{return null!=this.body.querySelector("[id='"+t+"']")}catch(e){}},e.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},e.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},e.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},e}()}.call(this),function(){var e=[].slice;t.Renderer=function(){function t(){}var r;return t.render=function(){var t,r,n,o;return n=arguments[0],r=arguments[1],t=3<=arguments.length?e.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,t,function(){}),o.delegate=n,o.render(r),o},t.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},t.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},t.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},t}()}.call(this),function(){t.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.SnapshotRenderer=function(r){function n(e,r){this.currentSnapshot=e,this.newSnapshot=r,this.currentHeadDetails=new t.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new t.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return e(n,r),n.prototype.render=function(t){return this.trackedElementsAreIdentical()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},n.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},n.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},n.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},n.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},n.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},n.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},n.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},n.prototype.assignNewBody=function(){return document.body=this.newBody},n.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},n.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},n.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},n.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},n.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},n.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},n.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},n.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},n.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},n}(t.Renderer)}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.ErrorRenderer=function(t){function r(t){this.html=t}return e(r,t),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(t.Renderer)}.call(this),function(){t.View=function(){function e(t){this.delegate=t,this.element=document.documentElement}return e.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},e.prototype.getSnapshot=function(){return t.Snapshot.fromElement(this.element)},e.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,e):this.renderError(r,e)},e.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},e.prototype.renderSnapshot=function(e,r){return t.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),t.Snapshot.wrap(e))},e.prototype.renderError=function(e,r){return t.ErrorRenderer.render(this.delegate,r,e)},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=e(this.onScroll,this),this.onScroll=t.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){t.SnapshotCache=function(){function e(t){this.size=t,this.keys=[],this.snapshots={}}var r;return e.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},e.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},e.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},e.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},e.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},e.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},e.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(e){return t.Location.wrap(e).toCacheKey()},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=e(this.performScroll,this),this.identifier=t.uuid(),this.location=t.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new t.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(e,r){return this.response=e,null!=r&&(this.redirectedToLocation=t.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return t.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Controller=function(){function r(){this.clickBubbled=e(this.clickBubbled,this),this.clickCaptured=e(this.clickCaptured,this),this.pageLoaded=e(this.pageLoaded,this),this.history=new t.History(this),this.view=new t.View(this),this.scrollManager=new t.ScrollManager(this),this.restorationData={},this.clearCache()}return r.prototype.start=function(){return t.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new t.SnapshotCache(10)},r.prototype.visit=function(e,r){var n,o;return null==r&&(r={}),e=t.Location.wrap(e),this.applicationAllowsVisitingLocation(e)?this.locationIsVisitable(e)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(e,n)):window.location=e:void 0},r.prototype.startVisitToLocationWithAction=function(e,r,n){var o;return t.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(e,r,{restorationData:o})):window.location=e},r.prototype.startHistory=function(){return this.location=t.Location.wrap(window.location),this.restorationIdentifier=t.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(e,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(e,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=t.Location.wrap(e)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},r.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=document.getElementById(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(e,r){return t.dispatch("turbolinks:click",{target:e,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(e){return t.dispatch("turbolinks:before-visit",{data:{url:e.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(e){return t.dispatch("turbolinks:visit",{data:{url:e.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return t.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(e){
return t.dispatch("turbolinks:before-render",{data:{newBody:e}})},r.prototype.notifyApplicationAfterRender=function(){return t.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(e){return null==e&&(e={}),t.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:e}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(e,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new t.Visit(this,e,r),u.restorationIdentifier=null!=a?a:t.uuid(),u.restorationData=t.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(e){return this.nodeIsVisitable(e)?t.closest(e,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(e){var r;return r=new t.Location(e.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(e){var r;return(r=t.closest(e,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){var e,r,n;t.start=function(){return r()?(null==t.controller&&(t.controller=e()),t.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=t),n()},e=function(){var e;return e=new t.Controller,e.adapter=new t.BrowserAdapter(e),e},n=function(){return window.Turbolinks===t},n()&&t.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=t:"function"==typeof define&&define.amd&&define(t)}).call(this);
(function() {
  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(this);

  var ActionCable = this.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
App.product = App.cable.subscriptions.create("ProductChannel", {
  connected: function() {
    // Called when the subscription is ready for use on the server
  },

  disconnected: function() {
    // Called when the subscription has been terminated by the server
  },

  received: function(data) {
    // Called when there's incoming data on the websocket for this channel
    $(".alert.alert-info").show();
  }
});
(function() {


}).call(this);
/* jQuery elevateZoom 3.0.8 - Demo's and documentation: - www.elevateweb.co.uk/image-zoom - Copyright (c) 2013 Andrew Eades - www.elevateweb.co.uk - Dual licensed under the LGPL licenses. - http://en.wikipedia.org/wiki/MIT_License - http://en.wikipedia.org/wiki/GNU_General_Public_License */

"function"!==typeof Object.create&&(Object.create=function(d){function h(){}h.prototype=d;return new h});
(function(d,h,l,m){var k={init:function(b,a){var c=this;c.elem=a;c.$elem=d(a);c.imageSrc=c.$elem.data("zoom-image")?c.$elem.data("zoom-image"):c.$elem.attr("src");c.options=d.extend({},d.fn.elevateZoom.options,b);c.options.tint&&(c.options.lensColour="none",c.options.lensOpacity="1");"inner"==c.options.zoomType&&(c.options.showLens=!1);c.$elem.parent().removeAttr("title").removeAttr("alt");c.zoomImage=c.imageSrc;c.refresh(1);d("#"+c.options.gallery+" a").click(function(a){c.options.galleryActiveClass&&
(d("#"+c.options.gallery+" a").removeClass(c.options.galleryActiveClass),d(this).addClass(c.options.galleryActiveClass));a.preventDefault();d(this).data("zoom-image")?c.zoomImagePre=d(this).data("zoom-image"):c.zoomImagePre=d(this).data("image");c.swaptheimage(d(this).data("image"),c.zoomImagePre);return!1})},refresh:function(b){var a=this;setTimeout(function(){a.fetch(a.imageSrc)},b||a.options.refresh)},fetch:function(b){var a=this,c=new Image;c.onload=function(){a.largeWidth=c.width;a.largeHeight=
c.height;a.startZoom();a.currentImage=a.imageSrc;a.options.onZoomedImageLoaded(a.$elem)};c.src=b},startZoom:function(){var b=this;b.nzWidth=b.$elem.width();b.nzHeight=b.$elem.height();b.isWindowActive=!1;b.isLensActive=!1;b.isTintActive=!1;b.overWindow=!1;b.options.imageCrossfade&&(b.zoomWrap=b.$elem.wrap('<div style="height:'+b.nzHeight+"px;width:"+b.nzWidth+'px;" class="zoomWrapper" />'),b.$elem.css("position","absolute"));b.zoomLock=1;b.scrollingLock=!1;b.changeBgSize=!1;b.currentZoomLevel=b.options.zoomLevel;
b.nzOffset=b.$elem.offset();b.widthRatio=b.largeWidth/b.currentZoomLevel/b.nzWidth;b.heightRatio=b.largeHeight/b.currentZoomLevel/b.nzHeight;"window"==b.options.zoomType&&(b.zoomWindowStyle="overflow: hidden;background-position: 0px 0px;text-align:center;background-color: "+String(b.options.zoomWindowBgColour)+";width: "+String(b.options.zoomWindowWidth)+"px;height: "+String(b.options.zoomWindowHeight)+"px;float: left;background-size: "+b.largeWidth/b.currentZoomLevel+"px "+b.largeHeight/b.currentZoomLevel+
"px;display: none;z-index:100;border: "+String(b.options.borderSize)+"px solid "+b.options.borderColour+";background-repeat: no-repeat;position: absolute;");if("inner"==b.options.zoomType){var a=b.$elem.css("border-left-width");b.zoomWindowStyle="overflow: hidden;margin-left: "+String(a)+";margin-top: "+String(a)+";background-position: 0px 0px;width: "+String(b.nzWidth)+"px;height: "+String(b.nzHeight)+"px;float: left;display: none;cursor:"+b.options.cursor+";px solid "+b.options.borderColour+";background-repeat: no-repeat;position: absolute;"}"window"==
b.options.zoomType&&(lensHeight=b.nzHeight<b.options.zoomWindowWidth/b.widthRatio?b.nzHeight:String(b.options.zoomWindowHeight/b.heightRatio),lensWidth=b.largeWidth<b.options.zoomWindowWidth?b.nzWidth:b.options.zoomWindowWidth/b.widthRatio,b.lensStyle="background-position: 0px 0px;width: "+String(b.options.zoomWindowWidth/b.widthRatio)+"px;height: "+String(b.options.zoomWindowHeight/b.heightRatio)+"px;float: right;display: none;overflow: hidden;z-index: 999;-webkit-transform: translateZ(0);opacity:"+
b.options.lensOpacity+";filter: alpha(opacity = "+100*b.options.lensOpacity+"); zoom:1;width:"+lensWidth+"px;height:"+lensHeight+"px;background-color:"+b.options.lensColour+";cursor:"+b.options.cursor+";border: "+b.options.lensBorderSize+"px solid "+b.options.lensBorderColour+";background-repeat: no-repeat;position: absolute;");b.tintStyle="display: block;position: absolute;background-color: "+b.options.tintColour+";filter:alpha(opacity=0);opacity: 0;width: "+b.nzWidth+"px;height: "+b.nzHeight+"px;";
b.lensRound="";"lens"==b.options.zoomType&&(b.lensStyle="background-position: 0px 0px;float: left;display: none;border: "+String(b.options.borderSize)+"px solid "+b.options.borderColour+";width:"+String(b.options.lensSize)+"px;height:"+String(b.options.lensSize)+"px;background-repeat: no-repeat;position: absolute;");"round"==b.options.lensShape&&(b.lensRound="border-top-left-radius: "+String(b.options.lensSize/2+b.options.borderSize)+"px;border-top-right-radius: "+String(b.options.lensSize/2+b.options.borderSize)+
"px;border-bottom-left-radius: "+String(b.options.lensSize/2+b.options.borderSize)+"px;border-bottom-right-radius: "+String(b.options.lensSize/2+b.options.borderSize)+"px;");b.zoomContainer=d('<div class="zoomContainer" style="-webkit-transform: translateZ(0);position:absolute;left:'+b.nzOffset.left+"px;top:"+b.nzOffset.top+"px;height:"+b.nzHeight+"px;width:"+b.nzWidth+'px;"></div>');d("body").append(b.zoomContainer);b.options.containLensZoom&&"lens"==b.options.zoomType&&b.zoomContainer.css("overflow",
"hidden");"inner"!=b.options.zoomType&&(b.zoomLens=d("<div class='zoomLens' style='"+b.lensStyle+b.lensRound+"'>&nbsp;</div>").appendTo(b.zoomContainer).click(function(){b.$elem.trigger("click")}),b.options.tint&&(b.tintContainer=d("<div/>").addClass("tintContainer"),b.zoomTint=d("<div class='zoomTint' style='"+b.tintStyle+"'></div>"),b.zoomLens.wrap(b.tintContainer),b.zoomTintcss=b.zoomLens.after(b.zoomTint),b.zoomTintImage=d('<img style="position: absolute; left: 0px; top: 0px; max-width: none; width: '+
b.nzWidth+"px; height: "+b.nzHeight+'px;" src="'+b.imageSrc+'">').appendTo(b.zoomLens).click(function(){b.$elem.trigger("click")})));isNaN(b.options.zoomWindowPosition)?b.zoomWindow=d("<div style='z-index:999;left:"+b.windowOffsetLeft+"px;top:"+b.windowOffsetTop+"px;"+b.zoomWindowStyle+"' class='zoomWindow'>&nbsp;</div>").appendTo("body").click(function(){b.$elem.trigger("click")}):b.zoomWindow=d("<div style='z-index:999;left:"+b.windowOffsetLeft+"px;top:"+b.windowOffsetTop+"px;"+b.zoomWindowStyle+
"' class='zoomWindow'>&nbsp;</div>").appendTo(b.zoomContainer).click(function(){b.$elem.trigger("click")});b.zoomWindowContainer=d("<div/>").addClass("zoomWindowContainer").css("width",b.options.zoomWindowWidth);b.zoomWindow.wrap(b.zoomWindowContainer);"lens"==b.options.zoomType&&b.zoomLens.css({backgroundImage:"url('"+b.imageSrc+"')"});"window"==b.options.zoomType&&b.zoomWindow.css({backgroundImage:"url('"+b.imageSrc+"')"});"inner"==b.options.zoomType&&b.zoomWindow.css({backgroundImage:"url('"+b.imageSrc+
"')"});b.$elem.bind("touchmove",function(a){a.preventDefault();b.setPosition(a.originalEvent.touches[0]||a.originalEvent.changedTouches[0])});b.zoomContainer.bind("touchmove",function(a){"inner"==b.options.zoomType&&b.showHideWindow("show");a.preventDefault();b.setPosition(a.originalEvent.touches[0]||a.originalEvent.changedTouches[0])});b.zoomContainer.bind("touchend",function(a){b.showHideWindow("hide");b.options.showLens&&b.showHideLens("hide");b.options.tint&&"inner"!=b.options.zoomType&&b.showHideTint("hide")});
b.$elem.bind("touchend",function(a){b.showHideWindow("hide");b.options.showLens&&b.showHideLens("hide");b.options.tint&&"inner"!=b.options.zoomType&&b.showHideTint("hide")});b.options.showLens&&(b.zoomLens.bind("touchmove",function(a){a.preventDefault();b.setPosition(a.originalEvent.touches[0]||a.originalEvent.changedTouches[0])}),b.zoomLens.bind("touchend",function(a){b.showHideWindow("hide");b.options.showLens&&b.showHideLens("hide");b.options.tint&&"inner"!=b.options.zoomType&&b.showHideTint("hide")}));
b.$elem.bind("mousemove",function(a){!1==b.overWindow&&b.setElements("show");if(b.lastX!==a.clientX||b.lastY!==a.clientY)b.setPosition(a),b.currentLoc=a;b.lastX=a.clientX;b.lastY=a.clientY});b.zoomContainer.bind("mousemove",function(a){!1==b.overWindow&&b.setElements("show");if(b.lastX!==a.clientX||b.lastY!==a.clientY)b.setPosition(a),b.currentLoc=a;b.lastX=a.clientX;b.lastY=a.clientY});"inner"!=b.options.zoomType&&b.zoomLens.bind("mousemove",function(a){if(b.lastX!==a.clientX||b.lastY!==a.clientY)b.setPosition(a),
b.currentLoc=a;b.lastX=a.clientX;b.lastY=a.clientY});b.options.tint&&"inner"!=b.options.zoomType&&b.zoomTint.bind("mousemove",function(a){if(b.lastX!==a.clientX||b.lastY!==a.clientY)b.setPosition(a),b.currentLoc=a;b.lastX=a.clientX;b.lastY=a.clientY});"inner"==b.options.zoomType&&b.zoomWindow.bind("mousemove",function(a){if(b.lastX!==a.clientX||b.lastY!==a.clientY)b.setPosition(a),b.currentLoc=a;b.lastX=a.clientX;b.lastY=a.clientY});b.zoomContainer.add(b.$elem).mouseenter(function(){!1==b.overWindow&&
b.setElements("show")}).mouseleave(function(){b.scrollLock||b.setElements("hide")});"inner"!=b.options.zoomType&&b.zoomWindow.mouseenter(function(){b.overWindow=!0;b.setElements("hide")}).mouseleave(function(){b.overWindow=!1});b.minZoomLevel=b.options.minZoomLevel?b.options.minZoomLevel:2*b.options.scrollZoomIncrement;b.options.scrollZoom&&b.zoomContainer.add(b.$elem).bind("mousewheel DOMMouseScroll MozMousePixelScroll",function(a){b.scrollLock=!0;clearTimeout(d.data(this,"timer"));d.data(this,"timer",
setTimeout(function(){b.scrollLock=!1},250));var e=a.originalEvent.wheelDelta||-1*a.originalEvent.detail;a.stopImmediatePropagation();a.stopPropagation();a.preventDefault();0<e/120?b.currentZoomLevel>=b.minZoomLevel&&b.changeZoomLevel(b.currentZoomLevel-b.options.scrollZoomIncrement):b.options.maxZoomLevel?b.currentZoomLevel<=b.options.maxZoomLevel&&b.changeZoomLevel(parseFloat(b.currentZoomLevel)+b.options.scrollZoomIncrement):b.changeZoomLevel(parseFloat(b.currentZoomLevel)+b.options.scrollZoomIncrement);
return!1})},setElements:function(b){if(!this.options.zoomEnabled)return!1;"show"==b&&this.isWindowSet&&("inner"==this.options.zoomType&&this.showHideWindow("show"),"window"==this.options.zoomType&&this.showHideWindow("show"),this.options.showLens&&this.showHideLens("show"),this.options.tint&&"inner"!=this.options.zoomType&&this.showHideTint("show"));"hide"==b&&("window"==this.options.zoomType&&this.showHideWindow("hide"),this.options.tint||this.showHideWindow("hide"),this.options.showLens&&this.showHideLens("hide"),
this.options.tint&&this.showHideTint("hide"))},setPosition:function(b){if(!this.options.zoomEnabled)return!1;this.nzHeight=this.$elem.height();this.nzWidth=this.$elem.width();this.nzOffset=this.$elem.offset();this.options.tint&&"inner"!=this.options.zoomType&&(this.zoomTint.css({top:0}),this.zoomTint.css({left:0}));this.options.responsive&&!this.options.scrollZoom&&this.options.showLens&&(lensHeight=this.nzHeight<this.options.zoomWindowWidth/this.widthRatio?this.nzHeight:String(this.options.zoomWindowHeight/
this.heightRatio),lensWidth=this.largeWidth<this.options.zoomWindowWidth?this.nzWidth:this.options.zoomWindowWidth/this.widthRatio,this.widthRatio=this.largeWidth/this.nzWidth,this.heightRatio=this.largeHeight/this.nzHeight,"lens"!=this.options.zoomType&&(lensHeight=this.nzHeight<this.options.zoomWindowWidth/this.widthRatio?this.nzHeight:String(this.options.zoomWindowHeight/this.heightRatio),lensWidth=this.options.zoomWindowWidth<this.options.zoomWindowWidth?this.nzWidth:this.options.zoomWindowWidth/
this.widthRatio,this.zoomLens.css("width",lensWidth),this.zoomLens.css("height",lensHeight),this.options.tint&&(this.zoomTintImage.css("width",this.nzWidth),this.zoomTintImage.css("height",this.nzHeight))),"lens"==this.options.zoomType&&this.zoomLens.css({width:String(this.options.lensSize)+"px",height:String(this.options.lensSize)+"px"}));this.zoomContainer.css({top:this.nzOffset.top});this.zoomContainer.css({left:this.nzOffset.left});this.mouseLeft=parseInt(b.pageX-this.nzOffset.left);this.mouseTop=
parseInt(b.pageY-this.nzOffset.top);"window"==this.options.zoomType&&(this.Etoppos=this.mouseTop<this.zoomLens.height()/2,this.Eboppos=this.mouseTop>this.nzHeight-this.zoomLens.height()/2-2*this.options.lensBorderSize,this.Eloppos=this.mouseLeft<0+this.zoomLens.width()/2,this.Eroppos=this.mouseLeft>this.nzWidth-this.zoomLens.width()/2-2*this.options.lensBorderSize);"inner"==this.options.zoomType&&(this.Etoppos=this.mouseTop<this.nzHeight/2/this.heightRatio,this.Eboppos=this.mouseTop>this.nzHeight-
this.nzHeight/2/this.heightRatio,this.Eloppos=this.mouseLeft<0+this.nzWidth/2/this.widthRatio,this.Eroppos=this.mouseLeft>this.nzWidth-this.nzWidth/2/this.widthRatio-2*this.options.lensBorderSize);0>=this.mouseLeft||0>this.mouseTop||this.mouseLeft>this.nzWidth||this.mouseTop>this.nzHeight?this.setElements("hide"):(this.options.showLens&&(this.lensLeftPos=String(this.mouseLeft-this.zoomLens.width()/2),this.lensTopPos=String(this.mouseTop-this.zoomLens.height()/2)),this.Etoppos&&(this.lensTopPos=0),
this.Eloppos&&(this.tintpos=this.lensLeftPos=this.windowLeftPos=0),"window"==this.options.zoomType&&(this.Eboppos&&(this.lensTopPos=Math.max(this.nzHeight-this.zoomLens.height()-2*this.options.lensBorderSize,0)),this.Eroppos&&(this.lensLeftPos=this.nzWidth-this.zoomLens.width()-2*this.options.lensBorderSize)),"inner"==this.options.zoomType&&(this.Eboppos&&(this.lensTopPos=Math.max(this.nzHeight-2*this.options.lensBorderSize,0)),this.Eroppos&&(this.lensLeftPos=this.nzWidth-this.nzWidth-2*this.options.lensBorderSize)),
"lens"==this.options.zoomType&&(this.windowLeftPos=String(-1*((b.pageX-this.nzOffset.left)*this.widthRatio-this.zoomLens.width()/2)),this.windowTopPos=String(-1*((b.pageY-this.nzOffset.top)*this.heightRatio-this.zoomLens.height()/2)),this.zoomLens.css({backgroundPosition:this.windowLeftPos+"px "+this.windowTopPos+"px"}),this.changeBgSize&&(this.nzHeight>this.nzWidth?("lens"==this.options.zoomType&&this.zoomLens.css({"background-size":this.largeWidth/this.newvalueheight+"px "+this.largeHeight/this.newvalueheight+
"px"}),this.zoomWindow.css({"background-size":this.largeWidth/this.newvalueheight+"px "+this.largeHeight/this.newvalueheight+"px"})):("lens"==this.options.zoomType&&this.zoomLens.css({"background-size":this.largeWidth/this.newvaluewidth+"px "+this.largeHeight/this.newvaluewidth+"px"}),this.zoomWindow.css({"background-size":this.largeWidth/this.newvaluewidth+"px "+this.largeHeight/this.newvaluewidth+"px"})),this.changeBgSize=!1),this.setWindowPostition(b)),this.options.tint&&"inner"!=this.options.zoomType&&
this.setTintPosition(b),"window"==this.options.zoomType&&this.setWindowPostition(b),"inner"==this.options.zoomType&&this.setWindowPostition(b),this.options.showLens&&(this.fullwidth&&"lens"!=this.options.zoomType&&(this.lensLeftPos=0),this.zoomLens.css({left:this.lensLeftPos+"px",top:this.lensTopPos+"px"})))},showHideWindow:function(b){"show"!=b||this.isWindowActive||(this.options.zoomWindowFadeIn?this.zoomWindow.stop(!0,!0,!1).fadeIn(this.options.zoomWindowFadeIn):this.zoomWindow.show(),this.isWindowActive=
!0);"hide"==b&&this.isWindowActive&&(this.options.zoomWindowFadeOut?this.zoomWindow.stop(!0,!0).fadeOut(this.options.zoomWindowFadeOut):this.zoomWindow.hide(),this.isWindowActive=!1)},showHideLens:function(b){"show"!=b||this.isLensActive||(this.options.lensFadeIn?this.zoomLens.stop(!0,!0,!1).fadeIn(this.options.lensFadeIn):this.zoomLens.show(),this.isLensActive=!0);"hide"==b&&this.isLensActive&&(this.options.lensFadeOut?this.zoomLens.stop(!0,!0).fadeOut(this.options.lensFadeOut):this.zoomLens.hide(),
this.isLensActive=!1)},showHideTint:function(b){"show"!=b||this.isTintActive||(this.options.zoomTintFadeIn?this.zoomTint.css({opacity:this.options.tintOpacity}).animate().stop(!0,!0).fadeIn("slow"):(this.zoomTint.css({opacity:this.options.tintOpacity}).animate(),this.zoomTint.show()),this.isTintActive=!0);"hide"==b&&this.isTintActive&&(this.options.zoomTintFadeOut?this.zoomTint.stop(!0,!0).fadeOut(this.options.zoomTintFadeOut):this.zoomTint.hide(),this.isTintActive=!1)},setLensPostition:function(b){},
setWindowPostition:function(b){var a=this;if(isNaN(a.options.zoomWindowPosition))a.externalContainer=d("#"+a.options.zoomWindowPosition),a.externalContainerWidth=a.externalContainer.width(),a.externalContainerHeight=a.externalContainer.height(),a.externalContainerOffset=a.externalContainer.offset(),a.windowOffsetTop=a.externalContainerOffset.top,a.windowOffsetLeft=a.externalContainerOffset.left;else switch(a.options.zoomWindowPosition){case 1:a.windowOffsetTop=a.options.zoomWindowOffety;a.windowOffsetLeft=
+a.nzWidth;break;case 2:a.options.zoomWindowHeight>a.nzHeight&&(a.windowOffsetTop=-1*(a.options.zoomWindowHeight/2-a.nzHeight/2),a.windowOffsetLeft=a.nzWidth);break;case 3:a.windowOffsetTop=a.nzHeight-a.zoomWindow.height()-2*a.options.borderSize;a.windowOffsetLeft=a.nzWidth;break;case 4:a.windowOffsetTop=a.nzHeight;a.windowOffsetLeft=a.nzWidth;break;case 5:a.windowOffsetTop=a.nzHeight;a.windowOffsetLeft=a.nzWidth-a.zoomWindow.width()-2*a.options.borderSize;break;case 6:a.options.zoomWindowHeight>
a.nzHeight&&(a.windowOffsetTop=a.nzHeight,a.windowOffsetLeft=-1*(a.options.zoomWindowWidth/2-a.nzWidth/2+2*a.options.borderSize));break;case 7:a.windowOffsetTop=a.nzHeight;a.windowOffsetLeft=0;break;case 8:a.windowOffsetTop=a.nzHeight;a.windowOffsetLeft=-1*(a.zoomWindow.width()+2*a.options.borderSize);break;case 9:a.windowOffsetTop=a.nzHeight-a.zoomWindow.height()-2*a.options.borderSize;a.windowOffsetLeft=-1*(a.zoomWindow.width()+2*a.options.borderSize);break;case 10:a.options.zoomWindowHeight>a.nzHeight&&
(a.windowOffsetTop=-1*(a.options.zoomWindowHeight/2-a.nzHeight/2),a.windowOffsetLeft=-1*(a.zoomWindow.width()+2*a.options.borderSize));break;case 11:a.windowOffsetTop=a.options.zoomWindowOffety;a.windowOffsetLeft=-1*(a.zoomWindow.width()+2*a.options.borderSize);break;case 12:a.windowOffsetTop=-1*(a.zoomWindow.height()+2*a.options.borderSize);a.windowOffsetLeft=-1*(a.zoomWindow.width()+2*a.options.borderSize);break;case 13:a.windowOffsetTop=-1*(a.zoomWindow.height()+2*a.options.borderSize);a.windowOffsetLeft=
0;break;case 14:a.options.zoomWindowHeight>a.nzHeight&&(a.windowOffsetTop=-1*(a.zoomWindow.height()+2*a.options.borderSize),a.windowOffsetLeft=-1*(a.options.zoomWindowWidth/2-a.nzWidth/2+2*a.options.borderSize));break;case 15:a.windowOffsetTop=-1*(a.zoomWindow.height()+2*a.options.borderSize);a.windowOffsetLeft=a.nzWidth-a.zoomWindow.width()-2*a.options.borderSize;break;case 16:a.windowOffsetTop=-1*(a.zoomWindow.height()+2*a.options.borderSize);a.windowOffsetLeft=a.nzWidth;break;default:a.windowOffsetTop=
a.options.zoomWindowOffety,a.windowOffsetLeft=a.nzWidth}a.isWindowSet=!0;a.windowOffsetTop+=a.options.zoomWindowOffety;a.windowOffsetLeft+=a.options.zoomWindowOffetx;a.zoomWindow.css({top:a.windowOffsetTop});a.zoomWindow.css({left:a.windowOffsetLeft});"inner"==a.options.zoomType&&(a.zoomWindow.css({top:0}),a.zoomWindow.css({left:0}));a.windowLeftPos=String(-1*((b.pageX-a.nzOffset.left)*a.widthRatio-a.zoomWindow.width()/2));a.windowTopPos=String(-1*((b.pageY-a.nzOffset.top)*a.heightRatio-a.zoomWindow.height()/
2));a.Etoppos&&(a.windowTopPos=0);a.Eloppos&&(a.windowLeftPos=0);a.Eboppos&&(a.windowTopPos=-1*(a.largeHeight/a.currentZoomLevel-a.zoomWindow.height()));a.Eroppos&&(a.windowLeftPos=-1*(a.largeWidth/a.currentZoomLevel-a.zoomWindow.width()));a.fullheight&&(a.windowTopPos=0);a.fullwidth&&(a.windowLeftPos=0);if("window"==a.options.zoomType||"inner"==a.options.zoomType)1==a.zoomLock&&(1>=a.widthRatio&&(a.windowLeftPos=0),1>=a.heightRatio&&(a.windowTopPos=0)),a.largeHeight<a.options.zoomWindowHeight&&(a.windowTopPos=
0),a.largeWidth<a.options.zoomWindowWidth&&(a.windowLeftPos=0),a.options.easing?(a.xp||(a.xp=0),a.yp||(a.yp=0),a.loop||(a.loop=setInterval(function(){a.xp+=(a.windowLeftPos-a.xp)/a.options.easingAmount;a.yp+=(a.windowTopPos-a.yp)/a.options.easingAmount;a.scrollingLock?(clearInterval(a.loop),a.xp=a.windowLeftPos,a.yp=a.windowTopPos,a.xp=-1*((b.pageX-a.nzOffset.left)*a.widthRatio-a.zoomWindow.width()/2),a.yp=-1*((b.pageY-a.nzOffset.top)*a.heightRatio-a.zoomWindow.height()/2),a.changeBgSize&&(a.nzHeight>
a.nzWidth?("lens"==a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"}),a.zoomWindow.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"})):("lens"!=a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvaluewidth+"px "+a.largeHeight/a.newvalueheight+"px"}),a.zoomWindow.css({"background-size":a.largeWidth/a.newvaluewidth+"px "+a.largeHeight/a.newvaluewidth+"px"})),
a.changeBgSize=!1),a.zoomWindow.css({backgroundPosition:a.windowLeftPos+"px "+a.windowTopPos+"px"}),a.scrollingLock=!1,a.loop=!1):(a.changeBgSize&&(a.nzHeight>a.nzWidth?("lens"==a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"}),a.zoomWindow.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"})):("lens"!=a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvaluewidth+
"px "+a.largeHeight/a.newvaluewidth+"px"}),a.zoomWindow.css({"background-size":a.largeWidth/a.newvaluewidth+"px "+a.largeHeight/a.newvaluewidth+"px"})),a.changeBgSize=!1),a.zoomWindow.css({backgroundPosition:a.xp+"px "+a.yp+"px"}))},16))):(a.changeBgSize&&(a.nzHeight>a.nzWidth?("lens"==a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"}),a.zoomWindow.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/
a.newvalueheight+"px"})):("lens"==a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvaluewidth+"px "+a.largeHeight/a.newvaluewidth+"px"}),a.largeHeight/a.newvaluewidth<a.options.zoomWindowHeight?a.zoomWindow.css({"background-size":a.largeWidth/a.newvaluewidth+"px "+a.largeHeight/a.newvaluewidth+"px"}):a.zoomWindow.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"})),a.changeBgSize=!1),a.zoomWindow.css({backgroundPosition:a.windowLeftPos+
"px "+a.windowTopPos+"px"}))},setTintPosition:function(b){this.nzOffset=this.$elem.offset();this.tintpos=String(-1*(b.pageX-this.nzOffset.left-this.zoomLens.width()/2));this.tintposy=String(-1*(b.pageY-this.nzOffset.top-this.zoomLens.height()/2));this.Etoppos&&(this.tintposy=0);this.Eloppos&&(this.tintpos=0);this.Eboppos&&(this.tintposy=-1*(this.nzHeight-this.zoomLens.height()-2*this.options.lensBorderSize));this.Eroppos&&(this.tintpos=-1*(this.nzWidth-this.zoomLens.width()-2*this.options.lensBorderSize));
this.options.tint&&(this.fullheight&&(this.tintposy=0),this.fullwidth&&(this.tintpos=0),this.zoomTintImage.css({left:this.tintpos+"px"}),this.zoomTintImage.css({top:this.tintposy+"px"}))},swaptheimage:function(b,a){var c=this,e=new Image;c.options.loadingIcon&&(c.spinner=d("<div style=\"background: url('"+c.options.loadingIcon+"') no-repeat center;height:"+c.nzHeight+"px;width:"+c.nzWidth+'px;z-index: 2000;position: absolute; background-position: center center;"></div>'),c.$elem.after(c.spinner));
c.options.onImageSwap(c.$elem);e.onload=function(){c.largeWidth=e.width;c.largeHeight=e.height;c.zoomImage=a;c.zoomWindow.css({"background-size":c.largeWidth+"px "+c.largeHeight+"px"});c.zoomWindow.css({"background-size":c.largeWidth+"px "+c.largeHeight+"px"});c.swapAction(b,a)};e.src=a},swapAction:function(b,a){var c=this,e=new Image;e.onload=function(){c.nzHeight=e.height;c.nzWidth=e.width;c.options.onImageSwapComplete(c.$elem);c.doneCallback()};e.src=b;c.currentZoomLevel=c.options.zoomLevel;c.options.maxZoomLevel=
!1;"lens"==c.options.zoomType&&c.zoomLens.css({backgroundImage:"url('"+a+"')"});"window"==c.options.zoomType&&c.zoomWindow.css({backgroundImage:"url('"+a+"')"});"inner"==c.options.zoomType&&c.zoomWindow.css({backgroundImage:"url('"+a+"')"});c.currentImage=a;if(c.options.imageCrossfade){var f=c.$elem,g=f.clone();c.$elem.attr("src",b);c.$elem.after(g);g.stop(!0).fadeOut(c.options.imageCrossfade,function(){d(this).remove()});c.$elem.width("auto").removeAttr("width");c.$elem.height("auto").removeAttr("height");
f.fadeIn(c.options.imageCrossfade);c.options.tint&&"inner"!=c.options.zoomType&&(f=c.zoomTintImage,g=f.clone(),c.zoomTintImage.attr("src",a),c.zoomTintImage.after(g),g.stop(!0).fadeOut(c.options.imageCrossfade,function(){d(this).remove()}),f.fadeIn(c.options.imageCrossfade),c.zoomTint.css({height:c.$elem.height()}),c.zoomTint.css({width:c.$elem.width()}));c.zoomContainer.css("height",c.$elem.height());c.zoomContainer.css("width",c.$elem.width());"inner"!=c.options.zoomType||c.options.constrainType||
(c.zoomWrap.parent().css("height",c.$elem.height()),c.zoomWrap.parent().css("width",c.$elem.width()),c.zoomWindow.css("height",c.$elem.height()),c.zoomWindow.css("width",c.$elem.width()))}else c.$elem.attr("src",b),c.options.tint&&(c.zoomTintImage.attr("src",a),c.zoomTintImage.attr("height",c.$elem.height()),c.zoomTintImage.css({height:c.$elem.height()}),c.zoomTint.css({height:c.$elem.height()})),c.zoomContainer.css("height",c.$elem.height()),c.zoomContainer.css("width",c.$elem.width());c.options.imageCrossfade&&
(c.zoomWrap.css("height",c.$elem.height()),c.zoomWrap.css("width",c.$elem.width()));c.options.constrainType&&("height"==c.options.constrainType&&(c.zoomContainer.css("height",c.options.constrainSize),c.zoomContainer.css("width","auto"),c.options.imageCrossfade?(c.zoomWrap.css("height",c.options.constrainSize),c.zoomWrap.css("width","auto"),c.constwidth=c.zoomWrap.width()):(c.$elem.css("height",c.options.constrainSize),c.$elem.css("width","auto"),c.constwidth=c.$elem.width()),"inner"==c.options.zoomType&&
(c.zoomWrap.parent().css("height",c.options.constrainSize),c.zoomWrap.parent().css("width",c.constwidth),c.zoomWindow.css("height",c.options.constrainSize),c.zoomWindow.css("width",c.constwidth)),c.options.tint&&(c.tintContainer.css("height",c.options.constrainSize),c.tintContainer.css("width",c.constwidth),c.zoomTint.css("height",c.options.constrainSize),c.zoomTint.css("width",c.constwidth),c.zoomTintImage.css("height",c.options.constrainSize),c.zoomTintImage.css("width",c.constwidth))),"width"==
c.options.constrainType&&(c.zoomContainer.css("height","auto"),c.zoomContainer.css("width",c.options.constrainSize),c.options.imageCrossfade?(c.zoomWrap.css("height","auto"),c.zoomWrap.css("width",c.options.constrainSize),c.constheight=c.zoomWrap.height()):(c.$elem.css("height","auto"),c.$elem.css("width",c.options.constrainSize),c.constheight=c.$elem.height()),"inner"==c.options.zoomType&&(c.zoomWrap.parent().css("height",c.constheight),c.zoomWrap.parent().css("width",c.options.constrainSize),c.zoomWindow.css("height",
c.constheight),c.zoomWindow.css("width",c.options.constrainSize)),c.options.tint&&(c.tintContainer.css("height",c.constheight),c.tintContainer.css("width",c.options.constrainSize),c.zoomTint.css("height",c.constheight),c.zoomTint.css("width",c.options.constrainSize),c.zoomTintImage.css("height",c.constheight),c.zoomTintImage.css("width",c.options.constrainSize))))},doneCallback:function(){this.options.loadingIcon&&this.spinner.hide();this.nzOffset=this.$elem.offset();this.nzWidth=this.$elem.width();
this.nzHeight=this.$elem.height();this.currentZoomLevel=this.options.zoomLevel;this.widthRatio=this.largeWidth/this.nzWidth;this.heightRatio=this.largeHeight/this.nzHeight;"window"==this.options.zoomType&&(lensHeight=this.nzHeight<this.options.zoomWindowWidth/this.widthRatio?this.nzHeight:String(this.options.zoomWindowHeight/this.heightRatio),lensWidth=this.options.zoomWindowWidth<this.options.zoomWindowWidth?this.nzWidth:this.options.zoomWindowWidth/this.widthRatio,this.zoomLens&&(this.zoomLens.css("width",
lensWidth),this.zoomLens.css("height",lensHeight)))},getCurrentImage:function(){return this.zoomImage},getGalleryList:function(){var b=this;b.gallerylist=[];b.options.gallery?d("#"+b.options.gallery+" a").each(function(){var a="";d(this).data("zoom-image")?a=d(this).data("zoom-image"):d(this).data("image")&&(a=d(this).data("image"));a==b.zoomImage?b.gallerylist.unshift({href:""+a+"",title:d(this).find("img").attr("title")}):b.gallerylist.push({href:""+a+"",title:d(this).find("img").attr("title")})}):
b.gallerylist.push({href:""+b.zoomImage+"",title:d(this).find("img").attr("title")});return b.gallerylist},changeZoomLevel:function(b){this.scrollingLock=!0;this.newvalue=parseFloat(b).toFixed(2);newvalue=parseFloat(b).toFixed(2);maxheightnewvalue=this.largeHeight/(this.options.zoomWindowHeight/this.nzHeight*this.nzHeight);maxwidthtnewvalue=this.largeWidth/(this.options.zoomWindowWidth/this.nzWidth*this.nzWidth);"inner"!=this.options.zoomType&&(maxheightnewvalue<=newvalue?(this.heightRatio=this.largeHeight/
maxheightnewvalue/this.nzHeight,this.newvalueheight=maxheightnewvalue,this.fullheight=!0):(this.heightRatio=this.largeHeight/newvalue/this.nzHeight,this.newvalueheight=newvalue,this.fullheight=!1),maxwidthtnewvalue<=newvalue?(this.widthRatio=this.largeWidth/maxwidthtnewvalue/this.nzWidth,this.newvaluewidth=maxwidthtnewvalue,this.fullwidth=!0):(this.widthRatio=this.largeWidth/newvalue/this.nzWidth,this.newvaluewidth=newvalue,this.fullwidth=!1),"lens"==this.options.zoomType&&(maxheightnewvalue<=newvalue?
(this.fullwidth=!0,this.newvaluewidth=maxheightnewvalue):(this.widthRatio=this.largeWidth/newvalue/this.nzWidth,this.newvaluewidth=newvalue,this.fullwidth=!1)));"inner"==this.options.zoomType&&(maxheightnewvalue=parseFloat(this.largeHeight/this.nzHeight).toFixed(2),maxwidthtnewvalue=parseFloat(this.largeWidth/this.nzWidth).toFixed(2),newvalue>maxheightnewvalue&&(newvalue=maxheightnewvalue),newvalue>maxwidthtnewvalue&&(newvalue=maxwidthtnewvalue),maxheightnewvalue<=newvalue?(this.heightRatio=this.largeHeight/
newvalue/this.nzHeight,this.newvalueheight=newvalue>maxheightnewvalue?maxheightnewvalue:newvalue,this.fullheight=!0):(this.heightRatio=this.largeHeight/newvalue/this.nzHeight,this.newvalueheight=newvalue>maxheightnewvalue?maxheightnewvalue:newvalue,this.fullheight=!1),maxwidthtnewvalue<=newvalue?(this.widthRatio=this.largeWidth/newvalue/this.nzWidth,this.newvaluewidth=newvalue>maxwidthtnewvalue?maxwidthtnewvalue:newvalue,this.fullwidth=!0):(this.widthRatio=this.largeWidth/newvalue/this.nzWidth,this.newvaluewidth=
newvalue,this.fullwidth=!1));scrcontinue=!1;"inner"==this.options.zoomType&&(this.nzWidth>this.nzHeight&&(this.newvaluewidth<=maxwidthtnewvalue?scrcontinue=!0:(scrcontinue=!1,this.fullwidth=this.fullheight=!0)),this.nzHeight>this.nzWidth&&(this.newvaluewidth<=maxwidthtnewvalue?scrcontinue=!0:(scrcontinue=!1,this.fullwidth=this.fullheight=!0)));"inner"!=this.options.zoomType&&(scrcontinue=!0);scrcontinue&&(this.zoomLock=0,this.changeZoom=!0,this.options.zoomWindowHeight/this.heightRatio<=this.nzHeight&&
(this.currentZoomLevel=this.newvalueheight,"lens"!=this.options.zoomType&&"inner"!=this.options.zoomType&&(this.changeBgSize=!0,this.zoomLens.css({height:String(this.options.zoomWindowHeight/this.heightRatio)+"px"})),"lens"==this.options.zoomType||"inner"==this.options.zoomType)&&(this.changeBgSize=!0),this.options.zoomWindowWidth/this.widthRatio<=this.nzWidth&&("inner"!=this.options.zoomType&&this.newvaluewidth>this.newvalueheight&&(this.currentZoomLevel=this.newvaluewidth),"lens"!=this.options.zoomType&&
"inner"!=this.options.zoomType&&(this.changeBgSize=!0,this.zoomLens.css({width:String(this.options.zoomWindowWidth/this.widthRatio)+"px"})),"lens"==this.options.zoomType||"inner"==this.options.zoomType)&&(this.changeBgSize=!0),"inner"==this.options.zoomType&&(this.changeBgSize=!0,this.nzWidth>this.nzHeight&&(this.currentZoomLevel=this.newvaluewidth),this.nzHeight>this.nzWidth&&(this.currentZoomLevel=this.newvaluewidth)));this.setPosition(this.currentLoc)},closeAll:function(){self.zoomWindow&&self.zoomWindow.hide();
self.zoomLens&&self.zoomLens.hide();self.zoomTint&&self.zoomTint.hide()},changeState:function(b){"enable"==b&&(this.options.zoomEnabled=!0);"disable"==b&&(this.options.zoomEnabled=!1)}};d.fn.elevateZoom=function(b){return this.each(function(){var a=Object.create(k);a.init(b,this);d.data(this,"elevateZoom",a)})};d.fn.elevateZoom.options={zoomActivation:"hover",zoomEnabled:!0,preloading:1,zoomLevel:1,scrollZoom:!1,scrollZoomIncrement:0.1,minZoomLevel:!1,maxZoomLevel:!1,easing:!1,easingAmount:12,lensSize:200,
zoomWindowWidth:400,zoomWindowHeight:400,zoomWindowOffetx:0,zoomWindowOffety:0,zoomWindowPosition:1,zoomWindowBgColour:"#fff",lensFadeIn:!1,lensFadeOut:!1,debug:!1,zoomWindowFadeIn:!1,zoomWindowFadeOut:!1,zoomWindowAlwaysShow:!1,zoomTintFadeIn:!1,zoomTintFadeOut:!1,borderSize:4,showLens:!0,borderColour:"#888",lensBorderSize:1,lensBorderColour:"#000",lensShape:"square",zoomType:"window",containLensZoom:!1,lensColour:"white",lensOpacity:0.4,lenszoom:!1,tint:!1,tintColour:"#333",tintOpacity:0.4,gallery:!1,
galleryActiveClass:"zoomGalleryActive",imageCrossfade:!1,constrainType:!1,constrainSize:!1,loadingIcon:!1,cursor:"default",responsive:!0,onComplete:d.noop,onZoomedImageLoaded:function(){},onImageSwap:d.noop,onImageSwapComplete:d.noop}})(jQuery,window,document);
/*!
 * jQuery Raty - A Star Rating Plugin
 *
 * The MIT License
 *
 * @author  : Washington Botelho
 * @doc     : http://wbotelhos.com/raty
 * @version : 2.7.1
 *
 */


;
(function($) {
  'use strict';

  var methods = {
    init: function(options) {
      return this.each(function() {
        this.self = $(this);

        methods.destroy.call(this.self);

        this.opt = $.extend(true, {}, $.fn.raty.defaults, options);

        methods._adjustCallback.call(this);
        methods._adjustNumber.call(this);
        methods._adjustHints.call(this);

        this.opt.score = methods._adjustedScore.call(this, this.opt.score);

        if (this.opt.starType !== 'img') {
          methods._adjustStarType.call(this);
        }

        methods._adjustPath.call(this);
        methods._createStars.call(this);

        if (this.opt.cancel) {
          methods._createCancel.call(this);
        }

        if (this.opt.precision) {
          methods._adjustPrecision.call(this);
        }

        methods._createScore.call(this);
        methods._apply.call(this, this.opt.score);
        methods._setTitle.call(this, this.opt.score);
        methods._target.call(this, this.opt.score);

        if (this.opt.readOnly) {
          methods._lock.call(this);
        } else {
          this.style.cursor = 'pointer';

          methods._binds.call(this);
        }
      });
    },

    _adjustCallback: function() {
      var options = ['number', 'readOnly', 'score', 'scoreName', 'target', 'path'];

      for (var i = 0; i < options.length; i++) {
        if (typeof this.opt[options[i]] === 'function') {
          this.opt[options[i]] = this.opt[options[i]].call(this);
        }
      }
    },

    _adjustedScore: function(score) {
      if (!score) {
        return score;
      }

      return methods._between(score, 0, this.opt.number);
    },

    _adjustHints: function() {
      if (!this.opt.hints) {
        this.opt.hints = [];
      }

      if (!this.opt.halfShow && !this.opt.half) {
        return;
      }

      var steps = this.opt.precision ? 10 : 2;

      for (var i = 0; i < this.opt.number; i++) {
        var group = this.opt.hints[i];

        if (Object.prototype.toString.call(group) !== '[object Array]') {
          group = [group];
        }

        this.opt.hints[i] = [];

        for (var j = 0; j < steps; j++) {
          var
            hint = group[j],
            last = group[group.length - 1];

          if (last === undefined) {
            last = null;
          }

          this.opt.hints[i][j] = hint === undefined ? last : hint;
        }
      }
    },

    _adjustNumber: function() {
      this.opt.number = methods._between(this.opt.number, 1, this.opt.numberMax);
    },

    _adjustPath: function() {
      this.opt.path = this.opt.path || '';

      if (this.opt.path && this.opt.path.charAt(this.opt.path.length - 1) !== '/') {
        this.opt.path += '/';
      }
    },

    _adjustPrecision: function() {
      this.opt.half = true;
    },

    _adjustStarType: function() {
      var replaces = ['cancelOff', 'cancelOn', 'starHalf', 'starOff', 'starOn'];

      this.opt.path = '';

      for (var i = 0; i < replaces.length; i++) {
        this.opt[replaces[i]] = this.opt[replaces[i]].replace('.', '-');
      }
    },

    _apply: function(score) {
      methods._fill.call(this, score);

      if (score) {
        if (score > 0) {
          this.score.val(score);
        }

        methods._roundStars.call(this, score);
      }
    },

    _between: function(value, min, max) {
      return Math.min(Math.max(parseFloat(value), min), max);
    },

    _binds: function() {
      if (this.cancel) {
        methods._bindOverCancel.call(this);
        methods._bindClickCancel.call(this);
        methods._bindOutCancel.call(this);
      }

      methods._bindOver.call(this);
      methods._bindClick.call(this);
      methods._bindOut.call(this);
    },

    _bindClick: function() {
      var that = this;

      that.stars.on('click.raty', function(evt) {
        var
          execute = true,
          score   = (that.opt.half || that.opt.precision) ? that.self.data('score') : (this.alt || $(this).data('alt'));

        if (that.opt.click) {
          execute = that.opt.click.call(that, +score, evt);
        }

        if (execute || execute === undefined) {
          if (that.opt.half && !that.opt.precision) {
            score = methods._roundHalfScore.call(that, score);
          }

          methods._apply.call(that, score);
        }
      });
    },

    _bindClickCancel: function() {
      var that = this;

      that.cancel.on('click.raty', function(evt) {
        that.score.removeAttr('value');

        if (that.opt.click) {
          that.opt.click.call(that, null, evt);
        }
      });
    },

    _bindOut: function() {
      var that = this;

      that.self.on('mouseleave.raty', function(evt) {
        var score = +that.score.val() || undefined;

        methods._apply.call(that, score);
        methods._target.call(that, score, evt);
        methods._resetTitle.call(that);

        if (that.opt.mouseout) {
          that.opt.mouseout.call(that, score, evt);
        }
      });
    },

    _bindOutCancel: function() {
      var that = this;

      that.cancel.on('mouseleave.raty', function(evt) {
        var icon = that.opt.cancelOff;

        if (that.opt.starType !== 'img') {
          icon = that.opt.cancelClass + ' ' + icon;
        }

        methods._setIcon.call(that, this, icon);

        if (that.opt.mouseout) {
          var score = +that.score.val() || undefined;

          that.opt.mouseout.call(that, score, evt);
        }
      });
    },

    _bindOver: function() {
      var that   = this,
          action = that.opt.half ? 'mousemove.raty' : 'mouseover.raty';

      that.stars.on(action, function(evt) {
        var score = methods._getScoreByPosition.call(that, evt, this);

        methods._fill.call(that, score);

        if (that.opt.half) {
          methods._roundStars.call(that, score, evt);
          methods._setTitle.call(that, score, evt);

          that.self.data('score', score);
        }

        methods._target.call(that, score, evt);

        if (that.opt.mouseover) {
          that.opt.mouseover.call(that, score, evt);
        }
      });
    },

    _bindOverCancel: function() {
      var that = this;

      that.cancel.on('mouseover.raty', function(evt) {
        var
          starOff = that.opt.path + that.opt.starOff,
          icon    = that.opt.cancelOn;

        if (that.opt.starType === 'img') {
          that.stars.attr('src', starOff);
        } else {
          icon = that.opt.cancelClass + ' ' + icon;

          that.stars.attr('class', starOff);
        }

        methods._setIcon.call(that, this, icon);
        methods._target.call(that, null, evt);

        if (that.opt.mouseover) {
          that.opt.mouseover.call(that, null);
        }
      });
    },

    _buildScoreField: function() {
      return $('<input />', { name: this.opt.scoreName, type: 'hidden' }).appendTo(this);
    },

    _createCancel: function() {
      var icon   = this.opt.path + this.opt.cancelOff,
          cancel = $('<' + this.opt.starType + ' />', { title: this.opt.cancelHint, 'class': this.opt.cancelClass });

      if (this.opt.starType === 'img') {
        cancel.attr({ src: icon, alt: 'x' });
      } else {
        // TODO: use $.data
        cancel.attr('data-alt', 'x').addClass(icon);
      }

      if (this.opt.cancelPlace === 'left') {
        this.self.prepend('&#160;').prepend(cancel);
      } else {
        this.self.append('&#160;').append(cancel);
      }

      this.cancel = cancel;
    },

    _createScore: function() {
      var score = $(this.opt.targetScore);

      this.score = score.length ? score : methods._buildScoreField.call(this);
    },

    _createStars: function() {
      for (var i = 1; i <= this.opt.number; i++) {
        var
          name  = methods._nameForIndex.call(this, i),
          attrs = { alt: i, src: this.opt.path + this.opt[name] };

        if (this.opt.starType !== 'img') {
          attrs = { 'data-alt': i, 'class': attrs.src }; // TODO: use $.data.
        }

        attrs.title = methods._getHint.call(this, i);

        $('<' + this.opt.starType + ' />', attrs).appendTo(this);

        if (this.opt.space) {
          this.self.append(i < this.opt.number ? '&#160;' : '');
        }
      }

      this.stars = this.self.children(this.opt.starType);
    },

    _error: function(message) {
      $(this).text(message);

      $.error(message);
    },

    _fill: function(score) {
      var hash = 0;

      for (var i = 1; i <= this.stars.length; i++) {
        var
          icon,
          star   = this.stars[i - 1],
          turnOn = methods._turnOn.call(this, i, score);

        if (this.opt.iconRange && this.opt.iconRange.length > hash) {
          var irange = this.opt.iconRange[hash];

          icon = methods._getRangeIcon.call(this, irange, turnOn);

          if (i <= irange.range) {
            methods._setIcon.call(this, star, icon);
          }

          if (i === irange.range) {
            hash++;
          }
        } else {
          icon = this.opt[turnOn ? 'starOn' : 'starOff'];

          methods._setIcon.call(this, star, icon);
        }
      }
    },

    _getFirstDecimal: function(number) {
      var
        decimal = number.toString().split('.')[1],
        result  = 0;

      if (decimal) {
        result = parseInt(decimal.charAt(0), 10);

        if (decimal.slice(1, 5) === '9999') {
          result++;
        }
      }

      return result;
    },

    _getRangeIcon: function(irange, turnOn) {
      return turnOn ? irange.on || this.opt.starOn : irange.off || this.opt.starOff;
    },

    _getScoreByPosition: function(evt, icon) {
      var score = parseInt(icon.alt || icon.getAttribute('data-alt'), 10);

      if (this.opt.half) {
        var
          size    = methods._getWidth.call(this),
          percent = parseFloat((evt.pageX - $(icon).offset().left) / size);

        score = score - 1 + percent;
      }

      return score;
    },

    _getHint: function(score, evt) {
      if (score !== 0 && !score) {
        return this.opt.noRatedMsg;
      }

      var
        decimal = methods._getFirstDecimal.call(this, score),
        integer = Math.ceil(score),
        group   = this.opt.hints[(integer || 1) - 1],
        hint    = group,
        set     = !evt || this.move;

      if (this.opt.precision) {
        if (set) {
          decimal = decimal === 0 ? 9 : decimal - 1;
        }

        hint = group[decimal];
      } else if (this.opt.halfShow || this.opt.half) {
        decimal = set && decimal === 0 ? 1 : decimal > 5 ? 1 : 0;

        hint = group[decimal];
      }

      return hint === '' ? '' : hint || score;
    },

    _getWidth: function() {
      var width = this.stars[0].width || parseFloat(this.stars.eq(0).css('font-size'));

      if (!width) {
        methods._error.call(this, 'Could not get the icon width!');
      }

      return width;
    },

    _lock: function() {
      var hint = methods._getHint.call(this, this.score.val());

      this.style.cursor = '';
      this.title        = hint;

      this.score.prop('readonly', true);
      this.stars.prop('title', hint);

      if (this.cancel) {
        this.cancel.hide();
      }

      this.self.data('readonly', true);
    },

    _nameForIndex: function(i) {
      return this.opt.score && this.opt.score >= i ? 'starOn' : 'starOff';
    },

    _resetTitle: function(star) {
      for (var i = 0; i < this.opt.number; i++) {
        this.stars[i].title = methods._getHint.call(this, i + 1);
      }
    },

     _roundHalfScore: function(score) {
      var integer = parseInt(score, 10),
          decimal = methods._getFirstDecimal.call(this, score);

      if (decimal !== 0) {
        decimal = decimal > 5 ? 1 : 0.5;
      }

      return integer + decimal;
    },

    _roundStars: function(score, evt) {
      var
        decimal = (score % 1).toFixed(2),
        name    ;

      if (evt || this.move) {
        name = decimal > 0.5 ? 'starOn' : 'starHalf';
      } else if (decimal > this.opt.round.down) {               // Up:   [x.76 .. x.99]
        name = 'starOn';

        if (this.opt.halfShow && decimal < this.opt.round.up) { // Half: [x.26 .. x.75]
          name = 'starHalf';
        } else if (decimal < this.opt.round.full) {             // Down: [x.00 .. x.5]
          name = 'starOff';
        }
      }

      if (name) {
        var
          icon = this.opt[name],
          star = this.stars[Math.ceil(score) - 1];

        methods._setIcon.call(this, star, icon);
      }                                                         // Full down: [x.00 .. x.25]
    },

    _setIcon: function(star, icon) {
      star[this.opt.starType === 'img' ? 'src' : 'className'] = this.opt.path + icon;
    },

    _setTarget: function(target, score) {
      if (score) {
        score = this.opt.targetFormat.toString().replace('{score}', score);
      }

      if (target.is(':input')) {
        target.val(score);
      } else {
        target.html(score);
      }
    },

    _setTitle: function(score, evt) {
      if (score) {
        var
          integer = parseInt(Math.ceil(score), 10),
          star    = this.stars[integer - 1];

        star.title = methods._getHint.call(this, score, evt);
      }
    },

    _target: function(score, evt) {
      if (this.opt.target) {
        var target = $(this.opt.target);

        if (!target.length) {
          methods._error.call(this, 'Target selector invalid or missing!');
        }

        var mouseover = evt && evt.type === 'mouseover';

        if (score === undefined) {
          score = this.opt.targetText;
        } else if (score === null) {
          score = mouseover ? this.opt.cancelHint : this.opt.targetText;
        } else {
          if (this.opt.targetType === 'hint') {
            score = methods._getHint.call(this, score, evt);
          } else if (this.opt.precision) {
            score = parseFloat(score).toFixed(1);
          }

          var mousemove = evt && evt.type === 'mousemove';

          if (!mouseover && !mousemove && !this.opt.targetKeep) {
            score = this.opt.targetText;
          }
        }

        methods._setTarget.call(this, target, score);
      }
    },

    _turnOn: function(i, score) {
      return this.opt.single ? (i === score) : (i <= score);
    },

    _unlock: function() {
      this.style.cursor = 'pointer';
      this.removeAttribute('title');

      this.score.removeAttr('readonly');

      this.self.data('readonly', false);

      for (var i = 0; i < this.opt.number; i++) {
        this.stars[i].title = methods._getHint.call(this, i + 1);
      }

      if (this.cancel) {
        this.cancel.css('display', '');
      }
    },

    cancel: function(click) {
      return this.each(function() {
        var self = $(this);

        if (self.data('readonly') !== true) {
          methods[click ? 'click' : 'score'].call(self, null);

          this.score.removeAttr('value');
        }
      });
    },

    click: function(score) {
      return this.each(function() {
        if ($(this).data('readonly') !== true) {
          score = methods._adjustedScore.call(this, score);

          methods._apply.call(this, score);

          if (this.opt.click) {
            this.opt.click.call(this, score, $.Event('click'));
          }

          methods._target.call(this, score);
        }
      });
    },

    destroy: function() {
      return this.each(function() {
        var self = $(this),
            raw  = self.data('raw');

        if (raw) {
          self.off('.raty').empty().css({ cursor: raw.style.cursor }).removeData('readonly');
        } else {
          self.data('raw', self.clone()[0]);
        }
      });
    },

    getScore: function() {
      var score = [],
          value ;

      this.each(function() {
        value = this.score.val();

        score.push(value ? +value : undefined);
      });

      return (score.length > 1) ? score : score[0];
    },

    move: function(score) {
      return this.each(function() {
        var
          integer  = parseInt(score, 10),
          decimal  = methods._getFirstDecimal.call(this, score);

        if (integer >= this.opt.number) {
          integer = this.opt.number - 1;
          decimal = 10;
        }

        var
          width   = methods._getWidth.call(this),
          steps   = width / 10,
          star    = $(this.stars[integer]),
          percent = star.offset().left + steps * decimal,
          evt     = $.Event('mousemove', { pageX: percent });

        this.move = true;

        star.trigger(evt);

        this.move = false;
      });
    },

    readOnly: function(readonly) {
      return this.each(function() {
        var self = $(this);

        if (self.data('readonly') !== readonly) {
          if (readonly) {
            self.off('.raty').children(this.opt.starType).off('.raty');

            methods._lock.call(this);
          } else {
            methods._binds.call(this);
            methods._unlock.call(this);
          }

          self.data('readonly', readonly);
        }
      });
    },

    reload: function() {
      return methods.set.call(this, {});
    },

    score: function() {
      var self = $(this);

      return arguments.length ? methods.setScore.apply(self, arguments) : methods.getScore.call(self);
    },

    set: function(options) {
      return this.each(function() {
        $(this).raty($.extend({}, this.opt, options));
      });
    },

    setScore: function(score) {
      return this.each(function() {
        if ($(this).data('readonly') !== true) {
          score = methods._adjustedScore.call(this, score);

          methods._apply.call(this, score);
          methods._target.call(this, score);
        }
      });
    }
  };

  $.fn.raty = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist!');
    }
  };

  $.fn.raty.defaults = {
    cancel       : false,
    cancelClass  : 'raty-cancel',
    cancelHint   : 'Cancel this rating!',
    cancelOff    : 'cancel-off.png',
    cancelOn     : 'cancel-on.png',
    cancelPlace  : 'left',
    click        : undefined,
    half         : false,
    halfShow     : true,
    hints        : ['bad', 'poor', 'regular', 'good', 'gorgeous'],
    iconRange    : undefined,
    mouseout     : undefined,
    mouseover    : undefined,
    noRatedMsg   : 'Not rated yet!',
    number       : 5,
    numberMax    : 20,
    path         : undefined,
    precision    : false,
    readOnly     : false,
    round        : { down: 0.25, full: 0.6, up: 0.76 },
    score        : undefined,
    scoreName    : 'score',
    single       : false,
    space        : true,
    starHalf     : 'star-half.png',
    starOff      : 'star-off.png',
    starOn       : 'star-on.png',
    starType     : 'img',
    target       : undefined,
    targetFormat : '{score}',
    targetKeep   : false,
    targetScore  : undefined,
    targetText   : '',
    targetType   : 'hint'
  };

})(jQuery);
(function() {


}).call(this);
(function() {


}).call(this);
var refreshRating = function() {
  $('.rating').raty({
    starHalf: '/assets/star-half-db15fb9b3561d5c741d8aea9ef4f0957bd9bc51aa1caa6d7a5c316e083c1abd5.png',
    starOff: '/assets/star-off-6aaeebdaab93d594c005d366ce0d94fba02e7a07fd03557dbee8482f04a91c22.png',
    starOn: '/assets/star-on-fd26bf0ea0990cfd808f7540f958eed324b86fc609bf56ec2b3a5612cdfde5f5.png',
    scoreName: 'comment[rating]'
  });
    $('.rated').raty({
    starHalf: '/assets/star-half-db15fb9b3561d5c741d8aea9ef4f0957bd9bc51aa1caa6d7a5c316e083c1abd5.png',
    starOff: '/assets/star-off-6aaeebdaab93d594c005d366ce0d94fba02e7a07fd03557dbee8482f04a91c22.png',
    starOn: '/assets/star-on-fd26bf0ea0990cfd808f7540f958eed324b86fc609bf56ec2b3a5612cdfde5f5.png',
    readOnly: true,
    score: function() {
      return $(this).attr('data-score');
    }
  });
};

$(document).on('turbolinks:load ajaxSuccess', function() {
  refreshRating();

  $('.img-zoom').elevateZoom({ zoomType : "lens", lensShape : "round", lensSize : 200 });
});
(function() {


}).call(this);
(function() {


}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//



;
