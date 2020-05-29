'use strict';

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var page = module.superModule;

server.extend(page);
server.append('AddProduct', function (req, res, next) {
	var BasketMgr = require('dw/order/BasketMgr');
	var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var ProductLineItemsModel = require('*/cartridge/models/productLineItems');
    var HookMgr = require('dw/system/HookMgr');
    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var quantityTotal = ProductLineItemsModel.getTotalQuantity(currentBasket.productLineItems);
    if(currentBasket.getGiftCertificateLineItems().size()>0){
    	quantityTotal += HookMgr.callHook('app.minicart.form.calculateMiniCartTotal', 'calculateMiniCartTotal',currentBasket);
    }
    res.json({
        quantityTotal: quantityTotal,
        minicartCountOfItems: Resource.msgf('minicart.count', 'common', null, quantityTotal)
    });

    next();
});
 
module.exports = server.exports();
