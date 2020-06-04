# Plugin Gift Certificate - SFRA

# Using this cartridge  allow you following:   
- Creating gift certificate in SFRA  
- Checking gift certificate balance   
- Using gift certificate as a payment method at checkout

# Content:  
- Import the content asset kept inside site-import folder in your site manually which are applicable on gift certificate purchase form and checkout form section 

# Install Custom Gift Certificate Cartridge

- In the command prompt, navigate to the top level of the repository, for example, storefront-reference-architecture.
- Enter this command: <b>npm install</b>
- Repeat these steps for each repository. The npm client installs any packages a repository needs.
- Compile the JavaScript and Style Sheets.

        a. Navigate to the top level of the repository.
        
        b. Enter this command: npm run compile:js
        
        c. Enter this command: npm run compile:scss
        
        d. Enter this command: npm run compile:fonts
        

# Few changes in base custom cartridge :

- When user will purchase the gift certificate and the product at the same time cart quantity count should update in minicart section related changes : Controller : cartridge\controllers\Cart.js
- In Myaccount section orderhistory list should be rendered with product and gift certificate items, Such kinds of changes in this file : Models : \cartridge\models\order.js

# Cartridge Path Considerations
The plugin_giftcertificate plugin requires the app_storefront_base cartridge. In your cartridge path, include the cartridges in the following order:

<code>plugin_giftcertificate:app_storefront_custom:app_storefront_base</code>
