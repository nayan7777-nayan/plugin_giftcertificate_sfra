# Plugin Gift Certificate - SFRA

# Using this cartridge  allow you following:   
- Creating gift certificate in SFRA  
- Checking gift certificate balance   
- Using gift certificate as a payment method at checkout

# Content:  
- Import the content asset kept inside site-import folder in your site manually which are applicable on gift certificate purchase form and checkout form section 

# Few changes in base custom cartridge :

- Minicart total quantity count has changed on fly related change : Controller : cartridge\controllers\Cart.js
- In Myaccount section orderhistory list has rendered with consolidated with product and gift certificate items : Models : \cartridge\models\order.js
