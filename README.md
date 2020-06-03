# Plugin Gift Certificate - SFRA

# Using this cartridge  allow you following:   
- Creating gift certificate in SFRA  
- Checking gift certificate balance   
- Using gift certificate as a payment method at checkout

# Content:  
- Import the content asset kept inside site-import folder in your site manually which are applicable on gift certificate purchase form and checkout form section 

# Install Page Designer Cartridge

- In the command prompt, navigate to the top level of the repository, for example, storefront-reference-architecture.
- Enter this command: npm install
- Repeat these steps for each repository. The npm client installs any packages a repository needs.
- Compile the JavaScript and Style Sheets.

       <code>a. Navigate to the top level of the repository.
        b. Enter this command: npm run compile:js<br>
        c. Enter this command: npm run compile:scss<br>
        d. Enter this command: npm run compile:fonts</code>

# Few changes in base custom cartridge :

- Minicart total quantity count has changed on fly related change : Controller : cartridge\controllers\Cart.js
- In Myaccount section orderhistory list has rendered with consolidated with product and gift certificate items : Models : \cartridge\models\order.js

# Cartridge Path Considerations
The plugin_giftcertificate plugin requires the app_storefront_base cartridge. In your cartridge path, include the cartridges in the following order:

<code>plugin_giftcertificate:app_storefront_base</code>
