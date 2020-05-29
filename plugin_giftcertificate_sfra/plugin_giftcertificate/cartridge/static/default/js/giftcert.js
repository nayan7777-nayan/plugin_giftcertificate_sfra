/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "../plugin_giftcertificate/cartridge/client/default/js/giftcert.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../plugin_giftcertificate/cartridge/client/default/js/giftcert.js":
/*!*************************************************************************!*\
  !*** ../plugin_giftcertificate/cartridge/client/default/js/giftcert.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar processInclude = __webpack_require__(/*! base/util */ \"../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/util.js\");\n\n$(document).ready(function () {\n  processInclude(__webpack_require__(/*! ./giftcert/giftcert */ \"../plugin_giftcertificate/cartridge/client/default/js/giftcert/giftcert.js\"));\n});\n\n//# sourceURL=webpack:///../plugin_giftcertificate/cartridge/client/default/js/giftcert.js?");

/***/ }),

/***/ "../plugin_giftcertificate/cartridge/client/default/js/giftcert/giftcert.js":
/*!**********************************************************************************!*\
  !*** ../plugin_giftcertificate/cartridge/client/default/js/giftcert/giftcert.js ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var formValidation = __webpack_require__(/*! base/components/formValidation */ \"../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/components/formValidation.js\");\n\nvar createErrorNotification = __webpack_require__(/*! base/components/errorNotification */ \"../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/components/errorNotification.js\");\n/**\n * Updates the Mini-Cart quantity value after the customer has pressed the \"Add to Cart\" button\n * @param {string} response - ajax response from clicking the add to cart button\n */\n\n\nfunction handlePostCartAdd(response) {\n  $('.minicart').trigger('count:update', response);\n  var messageType = response.error ? 'alert-danger' : 'alert-success'; // show add to cart toast\n\n  if ($('.add-to-cart-messages').length === 0) {\n    $('body').append('<div class=\"add-to-cart-messages\"></div>');\n  }\n\n  $('.add-to-cart-messages').append('<div class=\"alert ' + messageType + ' add-to-basket-alert text-center\" role=\"alert\">' + response.message + '</div>');\n  setTimeout(function () {\n    $('.add-to-basket-alert').remove();\n  }, 5000);\n}\n/**\n * Used to initiate ajax call and update the form\n * @param {Object} form - gift certificate form\n * @param {boolean} isUpdate - boolean value to check if it is update action\n * @return {boolean} false\n */\n\n\nvar updateGiftCertForm = function (form, isUpdate) {\n  var url = form.attr('action');\n  form.spinner().start();\n  $.ajax({\n    url: url,\n    type: 'post',\n    dataType: 'json',\n    data: form.serialize(),\n    success: function (data) {\n      form.spinner().stop();\n\n      if (!data.success) {\n        formValidation(form, data);\n      } else {\n        if (!isUpdate) {\n          handlePostCartAdd(data);\n          form.find('input,textarea').val('');\n          return false;\n        }\n\n        location.href = data.redirectUrl;\n      }\n    },\n    error: function (err) {\n      if (err.responseJSON.redirectUrl) {\n        window.location.href = err.responseJSON.redirectUrl;\n      } else if (isUpdate) {\n        $('.error-gift-certificate').html('');\n        createErrorNotification($('.error-gift-certificate'), err.responseJSON.errorMessage);\n        $('.html, body').animate({\n          scrollTop: $('.error-gift-certificate').offset().top\n        }, 1000);\n      } else {\n        createErrorNotification($('.error-messaging'), err.responseJSON.errorMessage);\n      }\n\n      form.spinner().stop();\n    }\n  });\n  return false;\n};\n/**\n * Used to initiate ajax call and check gift card balance\n * @param {Object} form - check balance form\n */\n\n\nvar checkBalance = function (form) {\n  var url = form.attr('action');\n  form.spinner().start();\n  $.ajax({\n    url: url,\n    type: 'get',\n    dataType: 'json',\n    data: form.serialize(),\n    success: function (data) {\n      form.spinner().stop();\n\n      if (!data.success) {\n        formValidation(form, data);\n      } else {\n        $('#gift-balance-msg').html(data.giftCertificate.balance).removeClass('red');\n      }\n    },\n    error: function (err) {\n      form.spinner().stop();\n      $('#gift-balance-msg').html(err.responseJSON.error).addClass('red');\n    }\n  });\n};\n\nfunction displayMessage(data, button) {\n  $.spinner().stop();\n  var status;\n\n  if (data.success) {\n    status = 'alert-success';\n  } else {\n    status = 'alert-danger';\n  }\n\n  button.removeClass('moveToWishlist');\n}\n\nmodule.exports = {\n  addToBasket: function () {\n    $('form.giftcert').submit(function (e) {\n      var form = $(this);\n      e.preventDefault();\n      updateGiftCertForm(form, false);\n    });\n  },\n  updateGiftCertificate: function () {\n    $('body').on('click', '.update-gift-certificate', function (e) {\n      var form = $(this).parent('.giftcert');\n      e.preventDefault();\n      updateGiftCertForm(form, true);\n    });\n  },\n  checkGiftCertBalance: function () {\n    $('body').on('click', '#CheckBalanceButton', function (e) {\n      var form = $('.check-balance');\n      e.preventDefault();\n      checkBalance(form);\n    });\n  },\n  moveToWishlist: function () {\n    $('body').on('click', '.moveToWishlist', function (e) {\n      e.preventDefault();\n      var url = $(this).data('href');\n      var pid = $(this).data('pid');\n      var button = $(this);\n\n      if (!url || !pid) {\n        return;\n      }\n\n      $.spinner().start();\n      $(this).attr('disabled', true);\n      $.ajax({\n        url: url,\n        type: 'post',\n        dataType: 'json',\n        data: {\n          pid: pid\n        },\n        success: function (data) {\n          $('.moveToWishlist').text('Wishlist Added');\n          displayMessage(data, button);\n        },\n        error: function (err) {\n          displayMessage(err, button);\n        }\n      });\n    });\n  }\n};\n\n//# sourceURL=webpack:///../plugin_giftcertificate/cartridge/client/default/js/giftcert/giftcert.js?");

/***/ }),

/***/ "../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/components/errorNotification.js":
/*!**********************************************************************************************************************************************!*\
  !*** ../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/components/errorNotification.js ***!
  \**********************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (element, message) {\n  var errorHtml = '<div class=\"alert alert-danger alert-dismissible ' + 'fade show\" role=\"alert\">' + '<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">' + '<span aria-hidden=\"true\">&times;</span>' + '</button>' + message + '</div>';\n  $(element).append(errorHtml);\n};\n\n//# sourceURL=webpack:///../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/components/errorNotification.js?");

/***/ }),

/***/ "../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/components/formValidation.js":
/*!*******************************************************************************************************************************************!*\
  !*** ../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/components/formValidation.js ***!
  \*******************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n/**\n * Remove all validation. Should be called every time before revalidating form\n * @param {element} form - Form to be cleared\n * @returns {void}\n */\n\nfunction clearFormErrors(form) {\n  $(form).find('.form-control.is-invalid').removeClass('is-invalid');\n}\n\nmodule.exports = function (formElement, payload) {\n  // clear form validation first\n  clearFormErrors(formElement);\n  $('.alert', formElement).remove();\n\n  if (typeof payload === 'object' && payload.fields) {\n    Object.keys(payload.fields).forEach(function (key) {\n      if (payload.fields[key]) {\n        var feedbackElement = $(formElement).find('[name=\"' + key + '\"]').parent().children('.invalid-feedback');\n\n        if (feedbackElement.length > 0) {\n          if (Array.isArray(payload[key])) {\n            feedbackElement.html(payload.fields[key].join('<br/>'));\n          } else {\n            feedbackElement.html(payload.fields[key]);\n          }\n\n          feedbackElement.siblings('.form-control').addClass('is-invalid');\n        }\n      }\n    });\n  }\n\n  if (payload && payload.error) {\n    var form = $(formElement).prop('tagName') === 'FORM' ? $(formElement) : $(formElement).parents('form');\n    form.prepend('<div class=\"alert alert-danger\" role=\"alert\">' + payload.error.join('<br/>') + '</div>');\n  }\n};\n\n//# sourceURL=webpack:///../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/components/formValidation.js?");

/***/ }),

/***/ "../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/util.js":
/*!**********************************************************************************************************************!*\
  !*** ../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/util.js ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (include) {\n  if (typeof include === 'function') {\n    include();\n  } else if (typeof include === 'object') {\n    Object.keys(include).forEach(function (key) {\n      if (typeof include[key] === 'function') {\n        include[key]();\n      }\n    });\n  }\n};\n\n//# sourceURL=webpack:///../storefront-reference-architecture-master/cartridges/app_storefront_base/cartridge/client/default/js/util.js?");

/***/ })

/******/ });