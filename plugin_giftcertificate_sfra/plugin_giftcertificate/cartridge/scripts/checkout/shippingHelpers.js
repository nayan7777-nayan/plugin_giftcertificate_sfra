'use strict';

var base = module.superModule;

var collections = require('*/cartridge/scripts/util/collections');
var ShippingModel = require('*/cartridge/models/shipping');

var ArrayList = require('dw/util/ArrayList');

// Public (class) static model functions

/**
 * Plain JS object that represents a DW Script API dw.order.ShippingMethod object
 * @param {dw.order.Basket} currentBasket - the target Basket object
 * @param {Object} customer - the associated Customer Model object
 * @param {string} containerView - view of the shipping models (order or basket)
 * @returns {dw.util.ArrayList} an array of ShippingModels
 */
function getShippingModels(currentBasket, customer, containerView) {
	var shipments = currentBasket ? currentBasket.getShipments() : null;

	if (!shipments) return [];

	var shipmentWithPLI = new ArrayList();

	// skipping shipment only with gift certificate
	for (var i = 0; i < shipments.length; i++) {
		if (shipments[i].productLineItems.length > 0) {
			shipmentWithPLI.push(shipments[i]);
		}
	}

	return collections.map(shipmentWithPLI, function (shipment) {
		if (shipment.productLineItems.length > 0) {
			return new ShippingModel(shipment, null, customer, containerView);
		}
		return false;
	});
}

module.exports = {
	getShippingModels: getShippingModels,
	selectShippingMethod: base.selectShippingMethod,
	ensureShipmentHasMethod: base.ensureShipmentHasMethod,
	getShipmentByUUID: base.getShipmentByUUID,
	getAddressFromRequest: base.getAddressFromRequest,
	getApplicableShippingMethods: base.getApplicableShippingMethods
};
