'use strict';

var server = require('server');
var checkout = module.superModule;

server.extend(checkout);

var Transaction = require('dw/system/Transaction');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

// Main entry point for Checkout
server.append('Begin', function (req, res, next) {
        var BasketMgr = require('dw/order/BasketMgr');
        var currentBasket = BasketMgr.getCurrentBasket();
        var currentStage = res.getViewData().currentStage;
        var productLineItemExist = true;

        if (currentStage === 'shipping') {
            Transaction.wrap(function () {
                COHelpers.updateGiftCertificateShipments(currentBasket);
                basketCalculationHelpers.calculateTotals(currentBasket);
            });
        }
        
        if (currentBasket.getProductLineItems().size() === 0) {
            currentStage = 'payment';
            productLineItemExist = false;
        }

        res.setViewData({
            currentStage: currentStage,
            productLineItemExist: productLineItemExist
        })

        return next();
    }
);

server.prepend('Begin', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    if (!currentBasket) {
        res.redirect(URLUtils.url('Cart-Show'));
        return next();
    }
    var currentStage = req.querystring.stage ? req.querystring.stage : 'shipping';
    if (currentStage === 'shipping') {
        Transaction.wrap(function () {
            COHelpers.updateGiftCertificateShipments(currentBasket);
            basketCalculationHelpers.calculateTotals(currentBasket);
        });
    }
    
    return next();
});

module.exports = server.exports();
