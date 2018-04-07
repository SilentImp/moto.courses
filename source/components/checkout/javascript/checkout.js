import 'babel-polyfill';
import 'intl-polyfill';

if (Stripe !== undefined) {
  const stripe = Stripe('pk_test_DoqCioanEscOmfUYCQQjittH');
  const items = [{
    amount: 4000
    , label: 'maintenance.course'
  }];
  const paymentRequest = stripe.paymentRequest({
    country: 'US'
    , currency: 'uah'
    , requestPayerName: true
    , requestPayerEmail: true
    , requestPayerPhone: true
    , requestShipping: false
    , displayItems: items
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

  const updateCount = async () => {
    const response = await fetch('/skus');
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const sku = await response.json();
    const quantity = parseInt(sku.inventory.quantity, 10);
    const plural = new Intl.PluralRules('ru').select(quantity);
    const suffixes = new Map([
        ['many', 'Билетов осталось']
      , ['one', 'Билет остался']
      , ['few', 'Билета осталось']
    ]);
    document.querySelector('.checkout__skus').innerText = (quantity === 0)
      ? 'Билетов нет'
      : `${sku.inventory.quantity} ${suffixes.get(plural)}`;
    return sku;
  };

  const showButton = async (sku) => {
    const quantity = parseInt(sku.inventory.quantity, 10);
    const result = await paymentRequest.canMakePayment();
    if (result && (quantity > 0)) {
      prButton.mount('#payment-request-button');
    } else {
      document.getElementById('payment-request-button').style.display = 'none';
    }
  };

  (async () => {
    let sku = await updateCount();
    showButton(sku);
    paymentRequest.on('token', async (event) => {
      const { token } = event;
      const response = await fetch('/order', {
        method: 'POST'
        , body: JSON.stringify({ token, sku })
        , headers: {'content-type': 'application/json'}
      });
      if (response.ok) {
        event.complete('success');
      } else {
        event.complete('fail');
      }
      sku = await updateCount();
      showButton(sku);
    });
  })();
}
