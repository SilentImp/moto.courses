import 'babel-polyfill';
import Form from '../../form/javascript/form';

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
      ['many', `Осталось ${quantity} билетов`]
      , ['one', `Остался ${quantity} билет`]
      , ['few', `Осталось ${quantity} билета`]
    ]);
    document.querySelector('.checkout__skus').innerText = (quantity === 0)
      ? 'Билетов нет'
      : suffixes.get(plural);
    return sku;
  };

  const showButton = async (sku) => {
    const quantity = parseInt(sku.inventory.quantity, 10);
    const result = await paymentRequest.canMakePayment();
    const form = document.getElementById('payment-form');
    if (quantity > 0) {
      if (result) {
        const button = document.getElementById('checkout-button');
        button.style.display = 'inline-block';
        button.addEventListener('click', () => { paymentRequest.show(); });
      } else {
        form.style.display = 'block';
        if (['complete', 'interactive'].indexOf(document.readyState) > -1) {
          new Form().renderForm();
        } else {
          const stateChange = new Promise((resolve) => {
            document.onreadystatechange = () => {
              if (['complete', 'interactive'].indexOf(document.readyState) > -1) {
                resolve();
              }
            };
          });
          const DOMContentLoaded = new Promise((resolve) => {
            document.addEventListener('DOMContentLoaded', function () {
              resolve();
            });
          });

          Promise.race([stateChange, DOMContentLoaded]).then(() => {
            new Form().renderForm();
          });
        }
      }
    }
  };

  (async () => {
    let sku = await updateCount();
    showButton(sku);
    paymentRequest.on('token', async (event) => {
      const {token} = event;
      const response = await fetch('/order', {
        method: 'POST'
        , body: JSON.stringify({token, sku})
        , headers: {'content-type': 'application/json'}
      });
      if (response.ok) {
        event.complete('success');
      } else {
        event.complete('fail');
      }
      setTimeout(async () => {
        sku = await updateCount();
        await showButton(sku);
      }, 1000);
    });
  })();
}
