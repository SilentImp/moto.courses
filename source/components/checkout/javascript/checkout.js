import 'babel-polyfill';

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

  const getNoun = (number) => {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return 'many';
    }
    n %= 10;
    if (n === 1) {
      return 'one';
    }
    if (n >= 2 && n <= 4) {
      return 'few';
    }
    return 'many';
  };

  const updateCount = async () => {
    const response = await fetch('/skus');
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const sku = await response.json();
    const quantity = parseInt(sku.inventory.quantity, 10);
    const plural = getNoun(quantity);
    const suffixes = new Map([
        ['many', 'билетов осталось']
      , ['one', 'билет остался']
      , ['few', 'билета осталось']
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
      setTimeout(async () => {
        sku = await updateCount();
        showButton(sku);
      }, 1000);
    });
  })();
}
