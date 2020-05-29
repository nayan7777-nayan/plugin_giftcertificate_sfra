'use strict';

var server = require('server');
var checkoutShippingServices = module.superModule;

server.extend(checkoutShippingServices);

server.replace('ToggleMultiShip', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');
    var URLUtils = require('dw/web/URLUtils');
    var collections = require('*/cartridge/scripts/util/collections');
    var Locale = require('dw/util/Locale');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var shippingHelpers = require('*/cartridge/scripts/checkout/shippingHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();
    if (!currentBasket) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return;
    }

    var shipments = currentBasket.shipments;
    var defaultShipment = currentBasket.defaultShipment;
    var usingMultiShipping = req.form.usingMultiShip === 'true';

    req.session.privacyCache.set('usingMultiShipping', usingMultiShipping);


    if (usingMultiShipping) {
        var UUIDUtils = require('dw/util/UUIDUtils');
        // split line items into separate shipments
        Transaction.wrap(function () {
            collections.forEach(shipments, function (shipment) {
                if (shipment.productLineItems.length > 1) {
                    collections.forEach(shipment.productLineItems, function (lineItem) {
                        var uuid = UUIDUtils.createUUID();
                        var newShipment = currentBasket.createShipment(uuid);
                        // only true if customer is registered
                        if (req.currentCustomer.addressBook && req.currentCustomer.addressBook.preferredAddress) {
                            var preferredAddress = req.currentCustomer.addressBook.preferredAddress;
                            COHelpers.copyCustomerAddressToShipment(preferredAddress, newShipment);
                        }

                        shippingHelpers.selectShippingMethod(newShipment);
                        lineItem.setShipment(newShipment);
                    });
                }
            });

            shippingHelpers.selectShippingMethod(defaultShipment);
            defaultShipment.createShippingAddress();

            COHelpers.ensureNoEmptyShipments(req);

            basketCalculationHelpers.calculateTotals(currentBasket);
        });
    } else {
        // combine multiple shipments into a single one
        Transaction.wrap(function () {
            collections.forEach(shipments, function (shipment) {
                if (!shipment.default) {
                    collections.forEach(shipment.productLineItems, function (lineItem) {
                        lineItem.setShipment(defaultShipment);
                    });
                    
                    // check if shipment don't have giftCertificateLineItems then remove it
                    if (shipment.giftCertificateLineItems.size() == 0) {
                        currentBasket.removeShipment(shipment);
                    }
                }
            });

            shippingHelpers.selectShippingMethod(defaultShipment);
            defaultShipment.createShippingAddress();

            COHelpers.ensureNoEmptyShipments(req);

            if (req.currentCustomer.addressBook && req.currentCustomer.addressBook.preferredAddress) {
                var preferredAddress = req.currentCustomer.addressBook.preferredAddress;
                COHelpers.copyCustomerAddressToShipment(preferredAddress);
            }

            basketCalculationHelpers.calculateTotals(currentBasket);
        });
    }

    var currentLocale = Locale.getLocale(req.locale.id);

    var basketModel = new OrderModel(
        currentBasket,
        { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
    );

    res.json({
        customer: new AccountModel(req.currentCustomer),
        order: basketModel
    });

    next();
});

module.exports = server.exports();
