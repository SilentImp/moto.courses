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
    , displayItems: [{
      amount: 4000
      , label: 'maintenance.course'
    }]
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
    const response = await fetch('/skus');
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const sku = await response.json();
    document.querySelector('.checkout__skus').innerText = `${sku.inventory.quantity} мест осталось`;

    const result = await paymentRequest.canMakePayment();
    console.log('canMakePayment: ', result);
    if (result) {
      prButton.mount('#payment-request-button');
    } else {
      document.getElementById('payment-request-button').style.display = 'none';
    }

    paymentRequest.on('token', async (event) => {
      const { token } = event;
      console.info(sku, token);
      const response = await fetch('/orders', {
        method: 'POST'
        , body: JSON.stringify({ token, sku })
        , headers: {'content-type': 'application/json'}
      });
      if (response.ok) {
        event.complete('success');
      } else {
        event.complete('fail');
      }
    });
  })();
}
