import 'babel-polyfill';
import Form from '../../form/javascript/form';

function getCookie (name) {
  let cookie = {};
  document.cookie.split(';').forEach(function (el) {
    let [k, v] = el.split('=');
    cookie[k.trim()] = v;
  });
  return cookie[name];
};

const checkBoxSubscription = document.querySelector('.checkout .form__fieldset--checkbox');

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

  if (getCookie('moto_courses_subscription')) {
    checkBoxSubscription.style.display = 'none';
  }

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
        button.addEventListener('click', () => {
          paymentRequest.show();
        });
      } else {
        form.style.display = 'block';
        document.querySelector('.checkout .form__fieldset--checkbox').style.display = 'none';
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
    } else {
      document.getElementById('subscription-form').style.display = 'inline-block';
      document.querySelector('.checkout__wrapper').style.display = 'none';
    }
  };

  (async () => {
    let sku = await updateCount();
    showButton(sku);
    paymentRequest.on('token', async (event) => {
      const {token} = event;
      const phone = event.payerPhone;
      const name = event.payerName;
      const subscription = document.getElementById('checkout-subscription-checkbox').checked;
      const response = await fetch('/order', {
        method: 'POST'
        , body: JSON.stringify({token, sku, phone, name, subscription})
        , headers: {'content-type': 'application/json'}
      });
      if (subscription) {
        document.cookie = 'moto_courses_subscription=true';
      }
      const feedbackMessage = document.querySelector('.checkout__skus');
      if (response.ok) {
        event.complete('success');
        feedbackMessage.innerText = 'Оплата прошла успешно!';
        const response = await fetch('/skus');
        const sku = await response.json();
        const quantity = parseInt(sku.inventory.quantity, 10);
        if (quantity > 0) {
          document.getElementById('checkout-button').innerText = 'Купить еще';
        } else {
          document.getElementById('checkout-button').style.display = 'none';
        }
        if (subscription) checkBoxSubscription.style.display = 'none';
      } else {
        event.complete('fail');
      }
    });
  })();
}
