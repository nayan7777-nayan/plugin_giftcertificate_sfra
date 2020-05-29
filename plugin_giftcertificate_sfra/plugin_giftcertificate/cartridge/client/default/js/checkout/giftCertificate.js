var cleave = require('base/components/cleave');
/**
 * Checks if user has entered gift certificate or not.
 * @return {boolean} true/false
 */
var validateGiftCert = function () {
	var elm = $('.giftCertCode');
	if (elm.length === 0 || elm.val().length === 0) {
		var errorMessage = $('.gift-cert-wrapper').data('missing-error');
		$('#giftCertInvalidMessage').html(errorMessage);
		elm.addClass('is-invalid');
		return true;
	}

	$('#giftCertInvalidMessage').html('');
	elm.removeClass('is-invalid');
	return false;
};

/**
 * Function used to disable the other payment tabs if complete payment
 * is done via Gift Certificate
 */
// var disableNonGCTabs = function () {
// 	$('.nav-tabs li').each(function () {
// 		if ($(this).data('method-id') !== 'GIFT_CERTIFICATE') {
// 			$(this).hide();
// 		}
// 	});
// };


module.exports = {
	addGiftCertToBasket: function () {
		$('body').on('click', '.submit-giftCert', function (e) {
			e.preventDefault();
			if (validateGiftCert()) {
				return false;
			}

			var billingAddressForm = $('#dwfrm_billing .billing-address-block :input').serialize();

			$('body').trigger('checkout:serializeBilling', {
				form: $('#dwfrm_billing .billing-address-block'),
				data: billingAddressForm,
				callback: function (data) {
					if (data) {
						billingAddressForm = data;
					}
				}
			});


			var activeTabId = $('.tab-pane.active').attr('id');
			var paymentInfoSelector = '#dwfrm_billing .' + activeTabId + ' .payment-form-fields :input';
			var paymentInfoForm = $(paymentInfoSelector).serialize();

			$('body').trigger('checkout:serializeBilling', {
				form: $(paymentInfoSelector),
				data: paymentInfoForm,
				callback: function (data) {
					if (data) {
						paymentInfoForm = data;
					}
				}
			});

			var paymentForm = billingAddressForm + '&' + paymentInfoForm;
			var $balance = $('.balance');
			$.ajax({
				url: $(this).data('url'),
				type: 'post',
				dataType: 'json',
				data: paymentForm,
				success: function (data) {
					if (data.error) {
						if (data.redirectUrl) {
							window.location.href = data.redirectUrl;
						} else if (data.errorMessage) {
							$balance.html(data.errorMessage).removeClass('success').addClass('error');
							return;
						}
					} else {
						var tabs = $(data.renderedGiftCertHtml).find('.payment-options');
						$('.payment-options').replaceWith(tabs);
						var content = $(data.renderedGiftCertHtml).find('.payment-content');
						$('.payment-content').replaceWith(content);

						if (('.payment-content .gift-cert-used').length > 0) {
							$('.gift-cert-tab').trigger('click');
							// disableNonGCTabs();
						}

						if ($('.cardNumber').length && $('#cardType').length) {
							cleave.handleCreditCardNumber('.cardNumber', '#cardType');
						}
					}
				},
				error: function (err) {
					// enable the next:Place Order button here
					$('body').trigger('checkout:enableButton', '.next-step-button button');
					if (err.responseJSON && err.responseJSON.redirectUrl) {
						window.location.href = err.responseJSON.redirectUrl;
					}
				}
			});

			return false;
		});
	},
	checkBalance: function () {
		$('body').on('click', '.check-balance', function (e) {
			e.preventDefault();
			if (validateGiftCert()) {
				return false;
			}

			var giftCertCode = $('.giftCertCode').val();
			var $balance = $('.balance');
			var url = $(this).data('url');

			$.ajax({
				url: url,
				type: 'get',
				dataType: 'json',
				data: { giftCertCode: giftCertCode },
				success: function (data) {
					if (!data.giftCertificate) {
						$balance.html(data.error).removeClass('success').addClass('error');
						return;
					}
					$balance.html(data.giftCertificate.balance).removeClass('error').addClass('success');
				}
			});

			return false;
		});
	},
	deleteGiftCert: function () {
		$('body').on('click', '.giftcert-pi .remove', function (e) {
			e.preventDefault();
			var url = $(this).attr('href');
			var $balance = $('.balance');
			$.ajax({
				url: url,
				type: 'get',
				dataType: 'json',
				success: function (data) {
					if (data.error) {
						$balance.html(data.errorMessage).removeClass('success').addClass('error');
					} else {
						var tabs = $(data.renderedGiftCertHtml).find('.payment-options');
						$('.payment-options').replaceWith(tabs);
						var content = $(data.renderedGiftCertHtml).find('.payment-content');
						$('.payment-content').replaceWith(content);

						if ($('.cardNumber').length && $('#cardType').length) {
							cleave.handleCreditCardNumber('.cardNumber', '#cardType');
						}
					}
				}
			});
		});
	},
	updatePaymentMethodId: function () {
		$('body').on('click', '.nav-tabs li', function () {
			var method = $(this).data('method-id');
			$('.payment-information').attr('data-payment-method-id', method);
			$('.payment-information').data('payment-method-id', method);
		});
	}
};
