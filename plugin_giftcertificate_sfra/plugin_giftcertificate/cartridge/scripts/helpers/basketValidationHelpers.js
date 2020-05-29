'use strict';

var base = module.superModule;

// eslint-disable-next-line valid-jsdoc
/**
 * Validates basket content
 * @param {dw.order.Basket} basket existing basket
 * @returns {boolean}
 */
function validateContent(basket) {
	// type: dw.util.Collection
	var plis = basket.getProductLineItems();
	// type: dw.util.Collection
	var gclis = basket.getGiftCertificateLineItems();

	return (plis.size() === 0 && gclis.size() === 0) ? false : true;
}


module.exports = {
	validateProducts: base.validateProducts,
	validateCoupons: base.validateCoupons,
	validateShipments: base.validateShipments,
	validateContent: validateContent
};
