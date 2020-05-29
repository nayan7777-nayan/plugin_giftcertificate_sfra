var formValidation = require('base/components/formValidation');
var createErrorNotification = require('base/components/errorNotification');


/**
 * Updates the Mini-Cart quantity value after the customer has pressed the "Add to Cart" button
 * @param {string} response - ajax response from clicking the add to cart button
 */
function handlePostCartAdd(response) {
	$('.minicart').trigger('count:update', response);
	var messageType = response.error ? 'alert-danger' : 'alert-success';
	// show add to cart toast

	if ($('.add-to-cart-messages').length === 0) {
		$('body').append(
			'<div class="add-to-cart-messages"></div>'
		);
	}

	$('.add-to-cart-messages').append(
		'<div class="alert ' + messageType + ' add-to-basket-alert text-center" role="alert">'
		+ response.message
		+ '</div>'
	);

	setTimeout(function () {
		$('.add-to-basket-alert').remove();
	}, 5000);
}

/**
 * Used to initiate ajax call and update the form
 * @param {Object} form - gift certificate form
 * @param {boolean} isUpdate - boolean value to check if it is update action
 * @return {boolean} false
 */
var updateGiftCertForm = function (form, isUpdate) {
	var url = form.attr('action');
	form.spinner().start();
	$.ajax({
		url: url,
		type: 'post',
		dataType: 'json',
		data: form.serialize(),
		success: function (data) {
			form.spinner().stop();
			if (!data.success) {
				formValidation(form, data);
			} else {
				if (!isUpdate) {
					handlePostCartAdd(data);
					form.find('input,textarea').val('');
					return false;
				}
				location.href = data.redirectUrl;
			}
			
		},
		error: function (err) {
			if (err.responseJSON.redirectUrl) {
				window.location.href = err.responseJSON.redirectUrl;
			} else if (isUpdate) {
				$('.error-gift-certificate').html('');
				createErrorNotification($('.error-gift-certificate'), err.responseJSON.errorMessage);
				$('.html, body').animate({
					scrollTop: $('.error-gift-certificate').offset().top
				}, 1000);
			} else {
				createErrorNotification($('.error-messaging'), err.responseJSON.errorMessage);
			}
			form.spinner().stop();
		}
	});
	return false;
};

/**
 * Used to initiate ajax call and check gift card balance
 * @param {Object} form - check balance form
 */
var checkBalance = function (form) {
	var url = form.attr('action');
	form.spinner().start();
	$.ajax({
		url: url,
		type: 'get',
		dataType: 'json',
		data: form.serialize(),
		success: function (data) {
			form.spinner().stop();
			if (!data.success) {
				formValidation(form, data);
			} else {
				$('#gift-balance-msg').html(data.giftCertificate.balance).removeClass('red');
			}
		},
		error: function (err) {
			form.spinner().stop();
			$('#gift-balance-msg').html(err.responseJSON.error).addClass('red');
		}
	});
};

function displayMessage(data, button) {
    $.spinner().stop();
    var status;
    if (data.success) {
        status = 'alert-success';
    } else {
        status = 'alert-danger';
    }
    button.removeClass('moveToWishlist');
    
}

module.exports = {
	addToBasket: function () {
		$('form.giftcert').submit(function (e) {
			var form = $(this);
			e.preventDefault();
			updateGiftCertForm(form, false);
		});
	},
	updateGiftCertificate: function () {
		$('body').on('click', '.update-gift-certificate', function (e) {
			var form = $(this).parent('.giftcert');
			e.preventDefault();
			updateGiftCertForm(form, true);
		});
	},
	checkGiftCertBalance: function () {
		$('body').on('click', '#CheckBalanceButton', function (e) {
			var form = $('.check-balance');
			e.preventDefault();
			checkBalance(form);
		});
	},
	moveToWishlist: function () {
		$('body').on('click', '.moveToWishlist', function (e) {
			e.preventDefault();
            var url = $(this).data('href');
            var pid = $(this).data('pid');
            var button = $(this);
            if (!url || !pid) {
                return;
            }

            $.spinner().start();
            $(this).attr('disabled', true);
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: {
                    pid: pid
                },
                success: function (data) {
                	$('.moveToWishlist').text('Wishlist Added');
                    displayMessage(data, button);
                },
                error: function (err) {
                    displayMessage(err, button);
                }
            });
		});
	},
};
