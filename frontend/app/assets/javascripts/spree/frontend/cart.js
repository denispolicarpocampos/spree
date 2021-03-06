//= require spree/frontend/coupon_manager

Spree.ready(function ($) {
  var formUpdateCart = $('form#update-cart')

  if (formUpdateCart.length) {
    $('form#update-cart a.delete').show().one('click', function () {
      $(this).parents('.shopping-cart-item').first().find('input.shopping-cart-item-quantity-input').val(0)
      $(this).parents('form').first().submit()
      return false
    })
    $('form#update-cart input.shopping-cart-item-quantity-input').on('keyup', function(e) {
      var itemId = $(this).attr('data-id')
      var value = $(this).val()
      var newValue = isNaN(value) || value === '' ? value : parseInt(value, 10)
      var targetInputs = $("form#update-cart input.shopping-cart-item-quantity-input[data-id='" + itemId + "']")
      $(targetInputs).val(newValue)
    })
    $('form#update-cart input.shopping-cart-item-quantity-input').on('change', function(e) {
      formUpdateCart.submit()
    })
    $('form#update-cart button.shopping-cart-item-quantity-decrease-btn').off('click').on('click', function() {
      var itemId = $(this).attr('data-id')
      var input = $("input[data-id='" + itemId + "']")
      var inputValue = parseInt($(input).val(), 10)

      if (inputValue > 1) {
        $(input).val(inputValue - 1)
        formUpdateCart.submit()
      }
    })
    $('form#update-cart button.shopping-cart-item-quantity-increase-btn').off('click').on('click', function() {
      var itemId = $(this).attr('data-id')
      var input = $("input[data-id='" + itemId + "']")
      var inputValue = parseInt($(input).val(), 10)

      $(input).val(inputValue + 1)
      formUpdateCart.submit()
    })
    $('form#update-cart button#shopping-cart-coupon-code-button').off('click').on('click', function(event) {
      var couponCodeField = $('#order_coupon_code');

      if (!$.trim(couponCodeField.val()).length) {
        event.preventDefault()
        return false
      }
    })

    $('form#update-cart button#shopping-cart-remove-coupon-code-button').off('click').on('click', function(event) {
      var input = {
        appliedCouponCodeField: $('#order_applied_coupon_code'),
        couponCodeField: $('#order_coupon_code'),
        couponStatus: $('#coupon_status'),
        couponButton: $('#shopping-cart-coupon-code-button'),
        removeCouponButton: $('#shopping-cart-remove-coupon-code-button')
      }

      if (new CouponManager(input).removeCoupon()) {
        return true
      } else {
        event.preventDefault()
        return false
      }
    })
  }
  formUpdateCart.submit(function (event) {
    var input = {
      couponCodeField: $('#order_coupon_code'),
      couponStatus: $('#coupon_status'),
      couponButton: $('#shopping-cart-coupon-code-button')
    }
    var updateButton = $('form#update-cart #update-button')
    updateButton.attr('disabled', true)
    if ($.trim(input.couponCodeField.val()).length > 0) {
      // eslint-disable-next-line no-undef
      if (new CouponManager(input).applyCoupon()) {
        this.submit()
        return true
      } else {
        updateButton.attr('disabled', false)
        event.preventDefault()
        return false
      }
    }
  })

  if (!Spree.cartFetched) Spree.fetchCart()
})

Spree.fetchCart = function () {
  return $.ajax({
    url: Spree.pathFor('cart_link')
  }).done(function (data) {
    Spree.cartFetched = true
    return $('#link-to-cart').html(data)
  })
}

Spree.ensureCart = function (successCallback) {
  if (SpreeAPI.orderToken) {
    successCallback()
  } else {
    fetch(Spree.routes.ensure_cart, {
      method: 'POST',
      credentials: 'same-origin'
    }).then(function (response) {
      switch (response.status) {
        case 200:
          response.json().then(function (json) {
            SpreeAPI.orderToken = json.token
            successCallback()
          })
          break
      }
    })
  }
}
