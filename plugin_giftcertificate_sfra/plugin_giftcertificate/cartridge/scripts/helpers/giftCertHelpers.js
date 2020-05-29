'use strict';
var Transaction = require('dw/system/Transaction');
var Money = require('dw/value/Money');

/**
 * Gets a gift certificate line item.
 *
 * @param {dw.order.GiftCertificate} lineItems giftCertificate objects
 * @param {string} uuid - UUID of the gift certificate line item to retrieve.
 * @return {dw.order.GiftCertificate | null} giftCertificate object with the passed UUID or null if no gift certificate with the passed UUID exists in the cart.
 */
var getGiftCertificateLineItemByUUID = function (lineItems, uuid) {
	for (var it = lineItems.iterator(); it.hasNext();) {
		var item = it.next();
		if (item.getUUID() === uuid) {
			return item;
		}
	}
	return null;
};

/**
 * Builds Object from giftCertificateLineItem to update the form values
 * @param {dw.order.GiftCertificate} giftCertificateLineItem gift certificate line item
 * @return {Object} giftLineItemObj
 */
var getGiftLineItemObj = function (giftCertificateLineItem) {
	var giftLineItemObj = {};
	giftLineItemObj.from = giftCertificateLineItem.senderName;
	giftLineItemObj.lineItemId = giftCertificateLineItem.UUID;
	giftLineItemObj.recipient = giftCertificateLineItem.recipientName;
	giftLineItemObj.recipientEmail = giftCertificateLineItem.recipientEmail;
	giftLineItemObj.confirmRecipientEmail = giftCertificateLineItem.recipientEmail;
	giftLineItemObj.message = giftCertificateLineItem.message;
	giftLineItemObj.amount = giftCertificateLineItem.price.value;

	return giftLineItemObj;
};

/**
 * Generated HTML for edit gift certificate form
 * @param {Object} giftCertForm Gift Certificate Form object
 * @param {string} actionUrl ActionUrl for submitting the edit form
 * @return {string} template text
 */
var editGCLIHtmlRenderedHtml = function (giftCertForm, actionUrl) {
	var HashMap = require('dw/util/HashMap');
	var Template = require('dw/util/Template');
	var context = new HashMap();
	context.put('giftCertForm', giftCertForm);
	context.put('actionUrl', actionUrl);
	context.put('action', 'update');
	var template = new Template('checkout/giftcert/giftCertificateNoDecorator');
	return template.render(context).text;
};

/**
 * Creates a gift certificate in the customer basket using form input values.
 * If a gift certificate is added to a product list, a ProductListItem is added, otherwise a GiftCertificateLineItem
 * is added.
 * __Note:__ the form must be validated before this function is called.
 *
 * @param {dw.order.Basket} currentBasket -  current Basket.
 * @return {dw.order.GiftCertificateLineItem} gift certificate line item added to the
 * current basket or product list.
 */
function createGiftCert(currentBasket) {
	var giftCertificateLineItem;
	// eslint-disable-next-line no-undef
	var purchaseForm = session.forms.giftcert.purchase;

	Transaction.wrap(function () {
		giftCertificateLineItem = currentBasket.createGiftCertificateLineItem(purchaseForm.amount.value, purchaseForm.recipientEmail.value);
		giftCertificateLineItem.setRecipientName(purchaseForm.recipient.value);
		giftCertificateLineItem.setSenderName(purchaseForm.from.value);
		giftCertificateLineItem.setMessage(purchaseForm.message.value);
		return giftCertificateLineItem;
	});

	if (!giftCertificateLineItem) {
		return null;
	}

	return giftCertificateLineItem;
}

/**
 * Updates a gift certificate in the customer basket using form input values.
 * Gets the input values from the purchase form and assigns them to the gift certificate line item.
 * __Note:__ the form must be validated before calling this function.
 *
 * @transaction
 * @param {dw.order.Basket} currentBasket -  current Basket.
 * @return {dw.order.GiftCertificateLineItem} gift certificate line item added to the
 * current basket or product list.
 */
function updateGiftCert(currentBasket) {
	// eslint-disable-next-line no-undef
	var purchaseForm = session.forms.giftcert.purchase;
	var giftCertificateLineItems = currentBasket.getGiftCertificateLineItems();
	var giftCertificateLineItem = null;
	var giftCertificateLineItemUUID = purchaseForm.lineItemId.value;

	// eslint-disable-next-line no-undef
	if (giftCertificateLineItems.length > 0 && !empty(giftCertificateLineItemUUID)) {
		giftCertificateLineItem = getGiftCertificateLineItemByUUID(giftCertificateLineItems, giftCertificateLineItemUUID);
	}

	if (!giftCertificateLineItem) {
		return null;
	}

	Transaction.wrap(function () {
		giftCertificateLineItem.senderName = purchaseForm.from.value;
		giftCertificateLineItem.recipientName = purchaseForm.recipient.value;
		giftCertificateLineItem.recipientEmail = purchaseForm.recipientEmail.value;
		giftCertificateLineItem.message = purchaseForm.message.value;

		var amount = purchaseForm.amount.value;
		giftCertificateLineItem.basePrice = new Money(amount, giftCertificateLineItem.basePrice.currencyCode);
		giftCertificateLineItem.grossPrice = new Money(amount, giftCertificateLineItem.grossPrice.currencyCode);
		giftCertificateLineItem.netPrice = new Money(amount, giftCertificateLineItem.netPrice.currencyCode);
	});


	return giftCertificateLineItem;
}

/**
 * Internal helper function that validates the gift certificate form.
 * Validates the giftcert.purchase form and handles any errors.
 * @param {Object} form - gift certificate form object
 * @return {Object} giftCertForm
 */
var processAddToBasket = function (form) {
	var Resource = require('dw/web/Resource');
	var giftCertForm = form;
	// Validates confirmation of email address.
	var recipientEmailForm = giftCertForm.purchase.recipientEmail;
	var confirmRecipientEmailForm = giftCertForm.purchase.confirmRecipientEmail;

	if ((recipientEmailForm.value.toLowerCase() !== confirmRecipientEmailForm.value.toLowerCase())) {
		recipientEmailForm.valid = false;
		confirmRecipientEmailForm.valid = false;
		confirmRecipientEmailForm.error = Resource.msg('error.message.mismatch.email', 'forms', null);
		giftCertForm.valid = false;
	}

	// Validates amount in range.
	var amountForm = giftCertForm.purchase.amount;
	if (amountForm.valid && ((amountForm.value < 5) || (amountForm.value > 5000))) {
		amountForm.valid = false;
		amountForm.error = Resource.msg('giftcert.amountparseerror', 'forms', null);
		giftCertForm.valid = false;
	}

	return giftCertForm;
};

/**
 * Internal helper function that validates the check balance form.
 * Validates the giftcert.purchase form and handles any errors.
 * @param {Object} form - gift certificate form object
 * @return {Object} giftCertForm
 */
var processCheckBalance = function (form) {
	var checkBalanceForm = form;

	// Validates confirmation of email address.
	var giftCertIDForm = checkBalanceForm.balance.giftCertID;

	if (!giftCertIDForm.valid && empty(giftCertIDForm.value)) {
		giftCertIDForm.valid = false;
		checkBalanceForm.valid = false;
	}

	return checkBalanceForm;
};

/**
 * Create a gift certificate for a gift certificate line item in the order
 * @param {dw.order.GiftCertificateLineItem} giftCertificateLineItem - gift certificate line item in basket
 * @param {string} orderNo the order number of the order to associate gift certificate to
 * @return {dw.order.GiftCertificate} - gift certificate
 */
function createGiftCertificateFromLineItem(giftCertificateLineItem, orderNo) {
	var GiftCertificateMgr = require('dw/order/GiftCertificateMgr');
	var giftCertificate = GiftCertificateMgr.createGiftCertificate(giftCertificateLineItem.netPrice.value);
	giftCertificate.setRecipientEmail(giftCertificateLineItem.recipientEmail);
	giftCertificate.setRecipientName(giftCertificateLineItem.recipientName);
	giftCertificate.setSenderName(giftCertificateLineItem.senderName);
	giftCertificate.setMessage(giftCertificateLineItem.message);
	giftCertificate.setOrderNo(orderNo);
	
	return giftCertificate;
}

/**
 * Send an email to recipient of gift certificate
 * @param {dw.order.GiftCertificate} GiftCertificate - gift certificate object
 */
function sendGiftCertificateEmail(GiftCertificate) {
	var Resource = require('dw/web/Resource');
	var Site = require('dw/system/Site');

	var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
	var objGiftCertificate = {
			giftCertificateCode: GiftCertificate.giftCertificateCode,
			recipientName: GiftCertificate.recipientName,
			senderName: GiftCertificate.senderName,
			amount: GiftCertificate.amount,
			message: GiftCertificate.message
        }; 
	var emailObj = {
		to: GiftCertificate.getRecipientEmail(),
		subject: Resource.msg('resource.ordergcemsg', 'giftcert', null) + ' ' + GiftCertificate.getSenderName(),
		from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com',
		type: emailHelpers.emailTypes.orderConfirmation
	};

	emailHelpers.sendEmail(emailObj, 'mail/giftcert', objGiftCertificate);
}

module.exports = {
	getGiftCertificateLineItemByUUID: getGiftCertificateLineItemByUUID,
	getGiftLineItemObj: getGiftLineItemObj,
	editGCLIHtmlRenderedHtml: editGCLIHtmlRenderedHtml,
	createGiftCert: createGiftCert,
	updateGiftCert: updateGiftCert,
	processAddToBasket: processAddToBasket,
	createGiftCertificateFromLineItem: createGiftCertificateFromLineItem,
	sendGiftCertificateEmail: sendGiftCertificateEmail,
	processCheckBalance: processCheckBalance
};
