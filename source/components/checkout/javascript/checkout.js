import 'babel-polyfill';

let skusku = null;

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
    console.log(1);
    const result = await paymentRequest.canMakePayment();
    console.log('2: ', result);
    if (result) {
      prButton.mount('#payment-request-button');
    } else {
      document.getElementById('payment-request-button').style.display = 'none';
    }
  })();

  paymentRequest.on('token', async (event) => {
    console.warn(skusku);
    console.info({token: event.token.id, skusku});
    const response = await fetch('/charges', {
      method: 'POST'
      , body: JSON.stringify({token: event.token.id, skusku})
      , headers: {'content-type': 'application/json'}
    });

    if (response.ok) {
      event.complete('success');
    } else {
      event.complete('fail');
    }
  });
}

const skus = document.querySelector('.checkout__skus');
fetch('/skus').then((response) => response.json())
  .then((sku) => { skusku = sku; skus.innerText = sku.inventory.quantity + ' мест осталось'; }) // eslint-disable-line
  .catch((error) => { console.log(error); });
