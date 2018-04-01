import 'babel-polyfill';

const stripe = Stripe('pk_test_DoqCioanEscOmfUYCQQjittH');

const paymentRequest = stripe.paymentRequest({
  country: 'UA'
  , currency: 'uah'
  , total: {
    label: 'Мастеркласс'
    , amount: 10
  }
});

const elements = stripe.elements();
const prButton = elements.create('paymentRequestButton', {
  paymentRequest
  , style: {
    paymentRequestButton: {
      type: 'buy'
      , theme: 'dark'
    }
  }
});

(async () => {
  // Check the availability of the Payment Request API first.
  const result = await paymentRequest.canMakePayment();
  if (result) {
    prButton.mount('#payment-request-button');
  } else {
    document.getElementById('payment-request-button').style.display = 'none';
  }
})();

paymentRequest.on('token', async (ev) => {
  // Send the token to your server to charge it!
  const response = await fetch('/charges', {
    method: 'POST'
    , body: JSON.stringify({token: ev.token.id})
    , headers: {'content-type': 'application/json'}
  });

  if (response.ok) {
    // Report to the browser that the payment was successful, prompting
    // it to close the browser payment interface.
    ev.complete('success');
  } else {
    // Report to the browser that the payment failed, prompting it to
    // re-show the payment interface, or show an error message and close
    // the payment interface.
    ev.complete('fail');
  }
});
