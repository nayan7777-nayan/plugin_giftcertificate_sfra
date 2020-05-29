var base = module.superModule;

/**
 * @constructor
 * @classdesc totals class that represents the order totals of the current line item container
 *
 * @param {dw.order.lineItemContainer} lineItemContainer - The current user's line item container
 */
function totals(lineItemContainer) {
	base.call(this, lineItemContainer);
	var finalSubTotal;
	var total=[];
	var currencyCustomCode;
	if(lineItemContainer.giftCertificateTotalPrice!=""){
		 if(lineItemContainer.adjustedMerchandizeTotalPrice.available == true ||  lineItemContainer.giftCertificateTotalPrice.available == true){
			 finalSubTotal = lineItemContainer.adjustedMerchandizeTotalPrice.value + lineItemContainer.giftCertificateTotalPrice.value;
	    	 
			 currencyCustomCode = !lineItemContainer.adjustedMerchandizeTotalPrice.currencyCode ? lineItemContainer.adjustedMerchandizeTotalPrice.currencyCode : lineItemContainer.giftCertificateTotalPrice.currencyCode;
			 
			 this.subTotal = dw.util.Currency.getCurrency(currencyCustomCode).getSymbol()+finalSubTotal.toFixed(2);
		 }
    }
}


module.exports = totals;
