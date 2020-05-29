var base = module.superModule;

var GiftCertificateLineItemsModel = require('*/cartridge/models/giftCertificateLineItems');
var URLUtils = require('dw/web/URLUtils');
var ProductLineItemsModel = require('*/cartridge/models/productLineItems');
/**
 * @constructor
 * @classdesc CartModel class that represents the current basket
 *
 * @param {dw.order.Basket} basket - Current users's basket
 * @param {dw.campaign.DiscountPlan} discountPlan - set of applicable discounts
 */
function CartModel(basket) {
	base.call(this, basket);

	if (basket !== null) {
		var giftCertificateLineItemsModel = new GiftCertificateLineItemsModel(basket.getGiftCertificateLineItems(), 'basket');
		this.giftCertificateItems = giftCertificateLineItemsModel.items;
		this.actionUrls.removeGiftCertificate = URLUtils.url('GiftCert-RemoveGiftCertLineItem').toString();
		var productLineItemsModel = new ProductLineItemsModel(basket.productLineItems, 'basket');
		this.numItems = giftCertificateLineItemsModel.totalQuantity + productLineItemsModel.totalQuantity;
	} else {
		this.giftCertificateItems = [];
	}
}

module.exports = CartModel;
