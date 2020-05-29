'use strict';

/**
 * @constructor
 * @param {dw.util.Collection} gcPIs - the gift certificate payment instruments
 */
function GiftCertificatePI(gcPIs) {
	var formatMoney = require('dw/util/StringUtils').formatMoney;
	var gc = {};
	var gcObj = [];
	var total = 0;
	if (gcPIs.size() > 0) {
		for (var i = 0; i < gcPIs.size(); i++) {
			var gcPiObj = {};
			var gcPI = gcPIs[i];
			total += gcPI.paymentTransaction.amount;
			gcPiObj.maskedGiftCertifiacte = gcPI.getMaskedGiftCertificateCode();
			gcPiObj.amount = formatMoney(gcPI.paymentTransaction.amount);
			gcPiObj.giftCertCode = gcPI.getGiftCertificateID();
			gcObj.push(gcPiObj);
		}

		gc.gcPIs = gcObj;
		gc.total = parseFloat(total, 2);
	}

	return gc;
}

module.exports = GiftCertificatePI;
