'use strict';

var server = require('server');
var checkoutServices = module.superModule;

server.extend(checkoutServices);

var Resource = require('dw/web/Resource');
var BasketMgr = require('dw/order/BasketMgr');
var Transaction = require('dw/system/Transaction');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * Rednerd the gift certificate form to edit an existing added certificate
 */
server.get('RemoveGiftCertificate', server.middleware.https, function (req, res, next) {
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var giftCertCode = req.querystring.giftCertificateID;

    if (!empty(giftCertCode)) {
        var currentBasket = BasketMgr.getCurrentOrNewBasket();
        var paymentForm = server.forms.getForm('billing');

        var response = Transaction.wrap(function () {
            COHelpers.removeGiftCertificatePaymentInstrument(currentBasket, giftCertCode);
            basketCalculationHelpers.calculateTotals(currentBasket);
            return true;
        });

        paymentForm.clear();
        var renderedGiftCertHtml = COHelpers.getRenderedGCInstruments(req, currentBasket, paymentForm);

        if (response) {
            res.json({
                success: true,
                renderedGiftCertHtml: renderedGiftCertHtml,
            });
        }
    } else {
        res.json({
            error: true,
            errorMessage: Resource.msg('billinggiftcert.giftcertinvalid', 'giftcert', null)
        });
    }

    return next();
});

/**
 * Rednerd the gift certificate form to edit an existing added certificate
 */
server.get('CheckBalance', server.middleware.https, function (req, res, next) {
    var formatMoney = require('dw/util/StringUtils').formatMoney;
    var GiftCertificateMgr = require('dw/order/GiftCertificateMgr');
    var giftCertCode = req.querystring.giftCertCode;

    // fetch the gift certificate
    var giftCertificate = GiftCertificateMgr.getGiftCertificateByCode(giftCertCode);

    if (giftCertificate && giftCertificate.isEnabled()) {
        res.json({
            giftCertificate: {
                ID: giftCertificate.getGiftCertificateCode(),
                balance: Resource.msgf('billing.giftcertbalance','giftcert', null, formatMoney(giftCertificate.getBalance()))
            }
        });
    } else {
        res.json({
            error: Resource.msg('billing.giftcertinvalid', 'giftcert', null)
        });
    }

    return next();
});

/**
 * Rednerd the gift certificate form to edit an existing added certificate
 */
server.post('AddGiftCertificate', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var GiftCertificateMgr = require('dw/order/GiftCertificateMgr');

    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var formErrors = require('*/cartridge/scripts/formErrors');

    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var gc, newGCPaymentInstrument;

    if (!currentBasket) {
        res.json({
            error: true,
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    var paymentForm = server.forms.getForm('billing');
    var giftCertCode = paymentForm.giftCertFields.giftCertCode;

    if (empty(giftCertCode.value)) {
		giftCertCode.valid = false;
		giftCertCode.error = Resource.msg('billinggiftcert.giftcertinvalid', 'giftcert', null);
        paymentForm.valid = false;
        
        res.json({
            fields: formErrors.getFormErrors(paymentForm)
        });

        return next();
	}

    if (!empty(giftCertCode.value)) {
        gc = GiftCertificateMgr.getGiftCertificateByCode(giftCertCode.value);

        if (!gc || !gc.isEnabled() || (gc.getStatus() === gc.STATUS_PENDING)) {// make sure exists
            result = Resource.msg('billinggiftcert.giftcertinvalid', 'giftcert', null);
        } else if (gc.getStatus() === gc.STATUS_REDEEMED) {// make sure it has not been fully redeemed
            result = Resource.msg('billinggiftcert.giftcertnofunds', 'giftcert', null);
        } else if (gc.balance.currencyCode !== currentBasket.getCurrencyCode()) {// make sure the GC is in the right currency
            result = Resource.msg('billing.GIFTCERTIFICATE_CURRENCY_MISMATCH', 'giftcert', null);
        } else {
            newGCPaymentInstrument = Transaction.wrap(function () {
                gcPaymentInstrument = COHelpers.createGiftCertificatePaymentInstrument(currentBasket, gc);
                basketCalculationHelpers.calculateTotals(currentBasket);
                return gcPaymentInstrument;
            });

            paymentForm.clear();
            var renderedGiftCertHtml = COHelpers.getRenderedGCInstruments(req, currentBasket, paymentForm);

            res.json({
                renderedGiftCertHtml: renderedGiftCertHtml,
                error: false
            });

            return next();
        }
    }

    res.json({
        error: true,
        errorMessage: result
    });

    return next();
});

/**
 *  Handle Ajax payment (and billing) form submit
 */
server.replace(
    'SubmitPayment',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var PaymentManager = require('dw/order/PaymentMgr');
        var HookManager = require('dw/system/HookMgr');
        var Resource = require('dw/web/Resource');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

        var viewData = {};
        var paymentForm = server.forms.getForm('billing');
        var giftCertCode = paymentForm.giftCertFields.giftCertCode;
        // verify billing form data
        var billingFormErrors = COHelpers.validateBillingForm(paymentForm.addressFields);
        var contactInfoFormErrors = COHelpers.validateFields(paymentForm.contactInfoFields);

        var formFieldErrors = [];
        if (Object.keys(billingFormErrors).length) {
            formFieldErrors.push(billingFormErrors);
        } else {
            viewData.address = {
                firstName: { value: paymentForm.addressFields.firstName.value },
                lastName: { value: paymentForm.addressFields.lastName.value },
                address1: { value: paymentForm.addressFields.address1.value },
                address2: { value: paymentForm.addressFields.address2.value },
                city: { value: paymentForm.addressFields.city.value },
                postalCode: { value: paymentForm.addressFields.postalCode.value },
                countryCode: { value: paymentForm.addressFields.country.value }
            };

            if (Object.prototype.hasOwnProperty.call(paymentForm.addressFields, 'states')) {
                viewData.address.stateCode = { value: paymentForm.addressFields.states.stateCode.value };
            }
        }

        if (Object.keys(contactInfoFormErrors).length) {
            formFieldErrors.push(contactInfoFormErrors);
        } else {
            viewData.email = {
                value: paymentForm.contactInfoFields.email.value
            };

            viewData.phone = { value: paymentForm.contactInfoFields.phone.value };
        }

        var paymentMethodIdValue = paymentForm.paymentMethod.value;
        if (!PaymentManager.getPaymentMethod(paymentMethodIdValue).paymentProcessor) {
            throw new Error(Resource.msg(
                'error.payment.processor.missing',
                'checkout',
                null
            ));
        }

        var paymentProcessor = PaymentManager.getPaymentMethod(paymentMethodIdValue).getPaymentProcessor();

        var paymentFormResult;
        if (HookManager.hasHook('app.payment.form.processor.' + paymentProcessor.ID.toLowerCase())) {
            paymentFormResult = HookManager.callHook('app.payment.form.processor.' + paymentProcessor.ID.toLowerCase(),
                'processForm',
                req,
                paymentForm,
                viewData
            );
        } else {
            paymentFormResult = HookManager.callHook('app.payment.form.processor.default_form_processor', 'processForm');
        }

        if (paymentFormResult.error && paymentFormResult.fieldErrors) {
            formFieldErrors.push(paymentFormResult.fieldErrors);
        }

        if (formFieldErrors.length || paymentFormResult.serverErrors) {
            // respond with form data and errors
            res.json({
                form: paymentForm,
                fieldErrors: formFieldErrors,
                serverErrors: paymentFormResult.serverErrors ? paymentFormResult.serverErrors : [],
                error: true
            });
            return next();
        }

        res.setViewData(paymentFormResult.viewData);

        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var BasketMgr = require('dw/order/BasketMgr');
            var HookMgr = require('dw/system/HookMgr');
            var PaymentMgr = require('dw/order/PaymentMgr');
            var PaymentInstrument = require('dw/order/PaymentInstrument');
            var Transaction = require('dw/system/Transaction');
            var AccountModel = require('*/cartridge/models/account');
            var OrderModel = require('*/cartridge/models/order');
            var URLUtils = require('dw/web/URLUtils');
            var Locale = require('dw/util/Locale');
            var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
            var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
            var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');

            var currentBasket = BasketMgr.getCurrentBasket();

            var billingData = res.getViewData();

            if (!currentBasket) {
                delete billingData.paymentInformation;

                res.json({
                    error: true,
                    cartError: true,
                    fieldErrors: [],
                    serverErrors: [],
                    redirectUrl: URLUtils.url('Cart-Show').toString()
                });
                return;
            }

            var validatedProducts = validationHelpers.validateProducts(currentBasket);
            if (validatedProducts.error) {
                delete billingData.paymentInformation;

                res.json({
                    error: true,
                    cartError: true,
                    fieldErrors: [],
                    serverErrors: [],
                    redirectUrl: URLUtils.url('Cart-Show').toString()
                });
                return;
            }

            var billingAddress = currentBasket.billingAddress;
            var billingForm = server.forms.getForm('billing');
            var paymentMethodID = billingData.paymentMethod.value;
            var result;

            billingForm.creditCardFields.cardNumber.htmlValue = '';
            billingForm.creditCardFields.securityCode.htmlValue = '';

            Transaction.wrap(function () {
                if (!billingAddress) {
                    billingAddress = currentBasket.createBillingAddress();
                }

                billingAddress.setFirstName(billingData.address.firstName.value);
                billingAddress.setLastName(billingData.address.lastName.value);
                billingAddress.setAddress1(billingData.address.address1.value);
                billingAddress.setAddress2(billingData.address.address2.value);
                billingAddress.setCity(billingData.address.city.value);
                billingAddress.setPostalCode(billingData.address.postalCode.value);
                if (Object.prototype.hasOwnProperty.call(billingData.address, 'stateCode')) {
                    billingAddress.setStateCode(billingData.address.stateCode.value);
                }
                billingAddress.setCountryCode(billingData.address.countryCode.value);

                if (billingData.storedPaymentUUID) {
                    billingAddress.setPhone(req.currentCustomer.profile.phone);
                    currentBasket.setCustomerEmail(req.currentCustomer.profile.email);
                } else {
                    billingAddress.setPhone(billingData.phone.value);
                    currentBasket.setCustomerEmail(billingData.email.value);
                }
            });

            // if there is no selected payment option and balance is greater than zero
            if (!paymentMethodID && currentBasket.totalGrossPrice.value > 0) {
                var noPaymentMethod = {};

                noPaymentMethod[billingData.paymentMethod.htmlName] =
                    Resource.msg('error.no.selected.payment.method', 'payment', null);

                delete billingData.paymentInformation;

                res.json({
                    form: billingForm,
                    fieldErrors: [noPaymentMethod],
                    serverErrors: [],
                    error: true
                });
                return;
            }

            //skip payment card validation in case only Gift certificate is applied
            if(empty(giftCertCode) && !isset(giftCertCode)){
	            var nonGCAmount = COHelpers.getNonGiftCertificateAmount(currentBasket);
	
	            if (nonGCAmount > currentBasket.totalGrossPrice.value) {
	                // Validate payment instrument
	                var creditCardPaymentMethod = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD);
	                var paymentCard = PaymentMgr.getPaymentCard(billingData.paymentInformation.cardType.value);
	
	                var applicablePaymentCards = creditCardPaymentMethod.getApplicablePaymentCards(
	                    req.currentCustomer.raw,
	                    req.geolocation.countryCode,
	                    null
	                );
	
	
	                if (!applicablePaymentCards.contains(paymentCard)) {
	                    // Invalid Payment Instrument
	                    var invalidPaymentMethod = Resource.msg('error.payment.not.valid', 'checkout', null);
	                    delete billingData.paymentInformation;
	                    res.json({
	                        form: billingForm,
	                        fieldErrors: [],
	                        serverErrors: [invalidPaymentMethod],
	                        error: true
	                    });
	                    return;
	                }
	            }
            }
            // check to make sure there is a payment processor
            if (!PaymentMgr.getPaymentMethod(paymentMethodID).paymentProcessor) {
                throw new Error(Resource.msg(
                    'error.payment.processor.missing',
                    'checkout',
                    null
                ));
            }

            var processor = PaymentMgr.getPaymentMethod(paymentMethodID).getPaymentProcessor();

            if (HookMgr.hasHook('app.payment.processor.' + processor.ID.toLowerCase())) {
                result = HookMgr.callHook('app.payment.processor.' + processor.ID.toLowerCase(),
                    'Handle',
                    currentBasket,
                    billingData.paymentInformation
                );
            } else {
                result = HookMgr.callHook('app.payment.processor.default', 'Handle');
            }

            // need to invalidate credit card fields
            if (result.error) {
                delete billingData.paymentInformation;

                res.json({
                    form: billingForm,
                    fieldErrors: result.fieldErrors,
                    serverErrors: result.serverErrors,
                    error: true
                });
                return;
            }

            if (HookMgr.hasHook('app.payment.form.processor.' + processor.ID.toLowerCase())) {
                HookMgr.callHook('app.payment.form.processor.' + processor.ID.toLowerCase(),
                    'savePaymentInformation',
                    req,
                    currentBasket,
                    billingData
                );
            } else {
                HookMgr.callHook('app.payment.form.processor.default', 'savePaymentInformation');
            }

            // Calculate the basket
            Transaction.wrap(function () {
                basketCalculationHelpers.calculateTotals(currentBasket);
            });

            // Re-calculate the payments.
            var calculatedPaymentTransaction = COHelpers.calculatePaymentTransaction(
                currentBasket
            );

            if (calculatedPaymentTransaction.error) {
                res.json({
                    form: paymentForm,
                    fieldErrors: [],
                    serverErrors: [Resource.msg('error.technical', 'checkout', null)],
                    error: true
                });
                return;
            }

            var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
            if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
                req.session.privacyCache.set('usingMultiShipping', false);
                usingMultiShipping = false;
            }

            hooksHelper('app.customer.subscription', 'subscribeTo', [paymentForm.subscribe.checked, paymentForm.contactInfoFields.email.htmlValue], function () {});

            var currentLocale = Locale.getLocale(req.locale.id);

            var basketModel = new OrderModel(
                currentBasket,
                { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
            );

            var accountModel = new AccountModel(req.currentCustomer);
            var renderedStoredPaymentInstrument = COHelpers.getRenderedPaymentInstruments(
                req,
                accountModel
            );

            delete billingData.paymentInformation;

            res.json({
                renderedPaymentInstruments: renderedStoredPaymentInstrument,
                customer: accountModel,
                order: basketModel,
                form: billingForm,
                error: false
            });
        });

        return next();
    }
);

module.exports = server.exports();
