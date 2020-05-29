'use strict';
var base = module.superModule;

var GiftCertificateLineItemsModel = require('*/cartridge/models/giftCertificateLineItems');
var GiftCertificatePIModel = require('*/cartridge/models/giftCertificatePaymentInstrument');

/**
 * Order class that represents the current order
 * @param {dw.order.LineItemCtnr} lineItemContainer - Current users's basket/order
 * @param {Object} options - The current order's line items
 * @param {Object} options.config - Object to help configure the orderModel
 * @param {string} options.config.numberOfLineItems - helps determine the number of lineitems needed
 * @param {string} options.countryCode - the current request country code
 * @constructor
 */
function OrderModel(lineItemContainer, options) {
	base.call(this, lineItemContainer, options);
	// eslint-disable-next-line no-undef
	if (!empty(lineItemContainer)) {
		var giftCertificateLineItemsModel = new GiftCertificateLineItemsModel(lineItemContainer.getGiftCertificateLineItems(), 'order');
		this.giftCertificateItems = giftCertificateLineItemsModel.items;
		// eslint-disable-next-line no-undef
		if (!empty(this.items)) {
			this.items.totalQuantity += giftCertificateLineItemsModel.totalQuantity;
		}
		this.gcPaymentInstrument = new GiftCertificatePIModel(lineItemContainer.giftCertificatePaymentInstruments);
		this.totalGrossPrice = lineItemContainer.totalGrossPrice;
		this.productLineItemSize = lineItemContainer.getProductLineItems().size();

		var safeOptions = options || {};
		var shipmentWithPLI = [];
		// skipping shipment only with gift certificate
		for (var i = 0; i < lineItemContainer.shipments.length; i++) {
			if (lineItemContainer.shipments[i].productLineItems.length > 0) {
				shipmentWithPLI.push(lineItemContainer.shipments[i]);
			}
		}
		var usingMultiShipping = (safeOptions.usingMultiShipping
			|| shipmentWithPLI.length > 1);
		this.usingMultiShipping = usingMultiShipping;
	} else {
		this.giftCertificateItems = [];
		this.gcPaymentInstrument = [];
		this.productLineItemSize = 0;
		this.usingMultiShipping = null;
	}
}

module.exports = OrderModel;
