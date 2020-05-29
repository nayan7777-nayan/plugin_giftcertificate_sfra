'use strict';


/**
 * validates the current users basket
 * @param {dw.order.Basket} basket - The current user's basket
 * @param {boolean} validateTax - boolean that determines whether or not to validate taxes
 * @returns {Object} an error object
 */
function calculateMiniCartTotal(currentBasket) {
	
	return currentBasket.getGiftCertificateLineItems().size();
}

exports.calculateMiniCartTotal = calculateMiniCartTotal;
