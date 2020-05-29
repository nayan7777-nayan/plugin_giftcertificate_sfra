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
/******/ 	return __webpack_require__(__webpack_require__.s = "../plugin_giftcertificate/cartridge/client/default/js/checkout/summary.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../plugin_giftcertificate/cartridge/client/default/js/checkout/summary.js":
/*!*********************************************************************************!*\
  !*** ../plugin_giftcertificate/cartridge/client/default/js/checkout/summary.js ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n/**\n * updates the totals summary\n * @param {Array} totals - the totals data\n */\n\nfunction updateTotals(totals) {\n  $('.shipping-total-cost').text(totals.totalShippingCost);\n  $('.tax-total').text(totals.totalTax);\n  $('.sub-total').text(totals.subTotal);\n  $('.grand-total-sum').text(totals.grandTotal);\n\n  if (totals.orderLevelDiscountTotal.value > 0) {\n    $('.order-discount').show();\n    $('.order-discount-total').text('- ' + totals.orderLevelDiscountTotal.formatted);\n  } else {\n    $('.order-discount').hide();\n  }\n\n  if (totals.shippingLevelDiscountTotal.value > 0) {\n    $('.shipping-discount').show();\n    $('.shipping-discount-total').text('- ' + totals.shippingLevelDiscountTotal.formatted);\n  } else {\n    $('.shipping-discount').hide();\n  }\n}\n/**\n * updates the order gift certificate summary\n * @param {Object} order - the order model\n * @return {Object} $productSummary - gc summary\n */\n\n\nfunction updateOrderGiftSummaryInformation(order) {\n  var $productSummary = $('<div />');\n  order.giftCertificateItems.forEach(function (gc) {\n    var pli = $('[data-gc-line-item=' + gc.lineItem.UUID + ']');\n    $productSummary.append(pli);\n  });\n  return $productSummary.children();\n}\n/**\n * updates the order product shipping summary for an order model\n * @param {Object} order - the order model\n */\n\n\nfunction updateOrderProductSummaryInformation(order) {\n  var $productSummary = $('<div />');\n  order.shipping.forEach(function (shipping) {\n    shipping.productLineItems.items.forEach(function (lineItem) {\n      var pli = $('[data-product-line-item=' + lineItem.UUID + ']');\n      $productSummary.append(pli);\n    });\n    var address = shipping.shippingAddress || {};\n    var selectedMethod = shipping.selectedShippingMethod;\n    var nameLine = address.firstName ? address.firstName + ' ' : '';\n    if (address.lastName) nameLine += address.lastName;\n    var address1Line = address.address1;\n    var address2Line = address.address2;\n    var phoneLine = address.phone;\n    var shippingCost = selectedMethod ? selectedMethod.shippingCost : '';\n    var methodNameLine = selectedMethod ? selectedMethod.displayName : '';\n    var methodArrivalTime = selectedMethod && selectedMethod.estimatedArrivalTime ? '( ' + selectedMethod.estimatedArrivalTime + ' )' : '';\n    var tmpl = $('#pli-shipping-summary-template').clone();\n\n    if (shipping.productLineItems.items && shipping.productLineItems.items.length > 1) {\n      $('h5 > span').text(' - ' + shipping.productLineItems.items.length + ' ' + order.resources.items);\n    } else {\n      $('h5 > span').text('');\n    }\n\n    var stateRequiredAttr = $('#shippingState').attr('required');\n    var isRequired = stateRequiredAttr !== undefined && stateRequiredAttr !== false;\n    var stateExists = shipping.shippingAddress && shipping.shippingAddress.stateCode ? shipping.shippingAddress.stateCode : false;\n    var stateBoolean = false;\n\n    if (isRequired && stateExists || !isRequired) {\n      stateBoolean = true;\n    }\n\n    var shippingForm = $('.multi-shipping input[name=\"shipmentUUID\"][value=\"' + shipping.UUID + '\"]').parent();\n\n    if (shipping.shippingAddress && shipping.shippingAddress.firstName && shipping.shippingAddress.address1 && shipping.shippingAddress.city && stateBoolean && shipping.shippingAddress.countryCode && (shipping.shippingAddress.phone || shipping.productLineItems.items[0].fromStoreId)) {\n      $('.ship-to-name', tmpl).text(nameLine);\n      $('.ship-to-address1', tmpl).text(address1Line);\n      $('.ship-to-address2', tmpl).text(address2Line);\n      $('.ship-to-city', tmpl).text(address.city);\n\n      if (address.stateCode) {\n        $('.ship-to-st', tmpl).text(address.stateCode);\n      }\n\n      $('.ship-to-zip', tmpl).text(address.postalCode);\n      $('.ship-to-phone', tmpl).text(phoneLine);\n\n      if (!address2Line) {\n        $('.ship-to-address2', tmpl).hide();\n      }\n\n      if (!phoneLine) {\n        $('.ship-to-phone', tmpl).hide();\n      }\n\n      shippingForm.find('.ship-to-message').text('');\n    } else {\n      shippingForm.find('.ship-to-message').text(order.resources.addressIncomplete);\n    }\n\n    if (shipping.isGift) {\n      $('.gift-message-summary', tmpl).text(shipping.giftMessage);\n    } else {\n      $('.gift-summary', tmpl).addClass('d-none');\n    } // checking h5 title shipping to or pickup\n\n\n    var $shippingAddressLabel = $('.shipping-header-text', tmpl);\n    $('body').trigger('shipping:updateAddressLabelText', {\n      selectedShippingMethod: selectedMethod,\n      resources: order.resources,\n      shippingAddressLabel: $shippingAddressLabel\n    });\n\n    if (shipping.selectedShippingMethod) {\n      $('.display-name', tmpl).text(methodNameLine);\n      $('.arrival-time', tmpl).text(methodArrivalTime);\n      $('.price', tmpl).text(shippingCost);\n    }\n\n    var $shippingSummary = $('<div class=\"multi-shipping\" data-shipment-summary=\"' + shipping.UUID + '\" />');\n    $shippingSummary.html(tmpl.html());\n    $productSummary.append($shippingSummary);\n  });\n\n  if (order.giftCertificateItems.length > 0) {\n    var $gcSummary = updateOrderGiftSummaryInformation(order);\n    $productSummary.append($gcSummary);\n  }\n\n  $('.product-summary-block').html($productSummary.html());\n}\n\nmodule.exports = {\n  updateTotals: updateTotals,\n  updateOrderProductSummaryInformation: updateOrderProductSummaryInformation\n};\n\n//# sourceURL=webpack:///../plugin_giftcertificate/cartridge/client/default/js/checkout/summary.js?");

/***/ })

/******/ });