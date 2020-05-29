'use strict';

var server = require('server');

var Transaction = require('dw/system/Transaction');
var URLUtils = require('dw/web/URLUtils');
var BasketMgr = require('dw/order/BasketMgr');
var Resource = require('dw/web/Resource');



var giftCertHelper = require('*/cartridge/scripts/helpers/giftCertHelpers');
var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * Renders form for adding gift certificate
 */
server.get('Purchase', csrfProtection.generateToken, function (req, res, next) {
    var giftCertForm = server.forms.getForm('giftcert');
    giftCertForm.clear();

    var actionUrl = URLUtils.https('GiftCert-AddToBasket');
    res.render('checkout/giftcert/giftcertpurchase', {
        giftCertForm: giftCertForm,
        actionUrl: actionUrl,
        action: 'add'
    });
    
    next();
});

/**
 * Adds a gift certificate in basket
 */
server.post('AddToBasket', csrfProtection.validateAjaxRequest, server.middleware.https, function (req, res, next) {
    var formErrors = require('*/cartridge/scripts/formErrors');
    var giftCertForm = giftCertHelper.processAddToBasket(server.forms.getForm('giftcert'));
    var ProductLineItemsModel = require('*/cartridge/models/productLineItems');

    if (giftCertForm.valid) {
        var currentBasket = BasketMgr.getCurrentOrNewBasket();
        var giftCertificateLineItem = giftCertHelper.createGiftCert(currentBasket);

        if (empty(giftCertificateLineItem)) {
            res.setStatusCode(500);
            res.json({
                success: false,
                errorMessage: Resource.msg('giftcert.server.error', 'forms', null)
            });

            return next();
        }
        
        Transaction.wrap(function() {
            basketCalculationHelpers.calculateTotals(currentBasket);
        });

        
        var quantityTotal = ProductLineItemsModel.getTotalQuantity(currentBasket.productLineItems);

        if (currentBasket.getGiftCertificateLineItems().size() > 0) {
            quantityTotal += currentBasket.getGiftCertificateLineItems().size()
        }

        res.json({
            success: true,
            redirectUrl: URLUtils.https('Cart-Show').toString(),
            quantityTotal: quantityTotal,
            minicartCountOfItems: Resource.msgf('minicart.count', 'common', null, quantityTotal),
            message: Resource.msg('giftcert.add.success', 'giftcert', null)
        });
    } else {
        res.json({
            fields: formErrors.getFormErrors(giftCertForm)
        });
    }

    return next();

});

/**
 * Updates a gift certificate in basket
 */
server.post('Update', server.middleware.https, function (req, res, next) {
    var formErrors = require('*/cartridge/scripts/formErrors');
    var giftCertForm = giftCertHelper.processAddToBasket(server.forms.getForm('giftcert'));

    if (giftCertForm.valid) {
        var currentBasket = BasketMgr.getCurrentOrNewBasket();
        var giftCertificateLineItem = giftCertHelper.updateGiftCert(currentBasket);

        if (empty(giftCertificateLineItem)) {
            res.setStatusCode(500);
            res.json({
                success: false,
                errorMessage: Resource.msg('giftcert.server.update.error', 'forms', null)
            });

            return next();
        }
        
        Transaction.wrap(function() {
            basketCalculationHelpers.calculateTotals(currentBasket);
        });

        res.json({
            success: true,
            redirectUrl: URLUtils.https('Cart-Show').toString()
        });
        
    } else {
        res.json({
            fields: formErrors.getFormErrors(giftCertForm)
        });
    }

    return next();

});

/**
 * Removes the gift certificate from the basket
 */
server.get('RemoveGiftCertLineItem', server.middleware.https, function (req, res, next) {
    var CartModel = require('*/cartridge/models/cart');
    var giftCertificateLineItemUUID = req.querystring.uuid;
    var giftCertificateLineItem = null;
    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var giftCertificateLineItems = currentBasket.getGiftCertificateLineItems();
    if (giftCertificateLineItems.length > 0 && !empty(giftCertificateLineItemUUID)) {
        giftCertificateLineItem = giftCertHelper.getGiftCertificateLineItemByUUID(giftCertificateLineItems, giftCertificateLineItemUUID);
    }
    
    var giftItemDeleted = false;
    if (!empty(giftCertificateLineItem)) {
        Transaction.wrap(function () {
            currentBasket.removeGiftCertificateLineItem(giftCertificateLineItem);
            basketCalculationHelpers.calculateTotals(currentBasket);
            giftItemDeleted = true;
        });
    }

    if (giftItemDeleted) {
        var basketModel = new CartModel(currentBasket);
        var basketModelPlus = {
            basket: basketModel,
            giftLineItemAvailable: giftCertificateLineItems > 1 ? true : false
        };
        res.json(basketModelPlus);
    } else {
        res.setStatusCode(500);
        res.json({ errorMessage: Resource.msg('error.cannot.remove.product', 'cart', null) });
    }

    return next();
});

/**
 * Rednerd the gift certificate form to edit an existing added certificate
 */
server.get('Edit', server.middleware.https, function (req, res, next) {
    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var giftCertificateLineItem = null;
    var giftCertificateLineItemUUID = req.querystring.uuid;
    var giftCertificateLineItems = currentBasket.getGiftCertificateLineItems();

    if (giftCertificateLineItems.length > 0 && !empty(giftCertificateLineItemUUID)) {
        giftCertificateLineItem = giftCertHelper.getGiftCertificateLineItemByUUID(giftCertificateLineItems, giftCertificateLineItemUUID);
    } else {
        res.setStatusCode(500);
        res.json({ errorMessage: Resource.msg('error.cannot.remove.product', 'cart', null) });
        return next();
    }

    var giftCertForm = server.forms.getForm('giftcert');
    giftCertForm.clear();
    if (!empty(giftCertificateLineItem)) {
        var giftLineItemObj = giftCertHelper.getGiftLineItemObj(giftCertificateLineItem);
        giftCertForm.copyFrom(giftLineItemObj);
    }
    
    var actionUrl = URLUtils.https('GiftCert-Update');
    var renderedHtml  = giftCertHelper.editGCLIHtmlRenderedHtml(giftCertForm, actionUrl);
    
    res.json({
        renderedTemplate: renderedHtml
    });

    return next();
    
});

/**
 * Rednerd the gift certificate form to edit an existing added certificate
 */
server.get('CheckBalance', server.middleware.https, function (req, res, next) {
    var formErrors = require('*/cartridge/scripts/formErrors');
    var giftCertForm = giftCertHelper.processCheckBalance(server.forms.getForm('giftcert'));

    if (giftCertForm.valid) {
        var GiftCertificateMgr = require('dw/order/GiftCertificateMgr');
        var formatMoney = require('dw/util/StringUtils').formatMoney;
        var giftCertCode = giftCertForm.balance.giftCertID.value;

        // fetch the gift certificate
        var giftCertificate = GiftCertificateMgr.getGiftCertificateByCode(giftCertCode);

        if (giftCertificate && giftCertificate.isEnabled()) {
            res.json({
                success: true,
                giftCertificate: {
                    ID: giftCertificate.getGiftCertificateCode(),
                    balance: Resource.msgf('billing.giftcertbalance','giftcert', null, formatMoney(giftCertificate.getBalance()))
                }
            });
        } else {
            res.setStatusCode(500);
            res.json({
                error: Resource.msg('billing.giftcertinvalid', 'giftcert', null)
            });
        }
    } else {
        res.json({
            fields: formErrors.getFormErrors(giftCertForm)
        });
    }

    return next();
});

module.exports = server.exports();
