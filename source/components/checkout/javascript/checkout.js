import 'babel-polyfill';

if (Stripe !== undefined) {
  const stripe = Stripe('pk_test_DoqCioanEscOmfUYCQQjittH');
  const paymentRequest = stripe.paymentRequest({
    country: 'US'
    , currency: 'uah'
    , requestPayerName: true
    , requestPayerEmail: true
    , requestPayerPhone: true
    , requestShipping: false
    , total: {
      label: 'Мастеркласс'
      , amount: 4000
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
    const result = await paymentRequest.canMakePayment();
    if (result) {
      prButton.mount('#payment-request-button');
    } else {
      document.getElementById('payment-request-button').style.display = 'none';
    }
  })();

  paymentRequest.on('token', async (event) => {
    console.warn(event);
    const response = await fetch('/charges', {
      method: 'POST'
      , body: JSON.stringify({token: event.token.id})
      , headers: {'content-type': 'application/json'}
    });

    if (response.ok) {
      event.complete('success');
    } else {
      event.complete('fail');
    }
  });
}
