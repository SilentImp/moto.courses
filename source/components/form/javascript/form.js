export default class Form {

  getCookie (name) {
    let cookie = {};
    document.cookie.split(';').forEach(function (el) {
      let [k, v] = el.split('=');
      cookie[k.trim()] = v;
    });
    return cookie[name];
  };

  renderForm () {
    const stripe = Stripe('pk_test_DoqCioanEscOmfUYCQQjittH');
    const elements = stripe.elements();
    const style = {
      base: {
        fontSize: '16px'
        , color: '#32325d'
        , '::placeholder': {
          color: '#aab7c4'
        }
      }
      , invalid: {
        color: '#fa755a'
        , iconColor: '#fa755a'
      }
    };

    const errorMessages = {
      incorrect_number: 'Неверный номер карты.'
      , invalid_number: 'Неверный номер карты.'
      , invalid_expiry_month: 'Неверный месяц окончания действия карты.'
      , invalid_expiry_year: 'Неверный год окончания действия карты.'
      , invalid_cvc: 'Неверный секретный код карты.'
      , expired_card: 'Срок действия карты истек.'
      , incorrect_cvc: 'Неверный секретный код (CVC) карты.'
      , card_declined: 'Карта была отклонена.'
      , processing_error: 'При обработке карты произошла ошибка.'
      , rate_limit: 'Слишком много запросов к API.'
    };

    console.log(document.cookie);
    if (this.getCookie('moto_courses_subscription')) {
      console.log('!!1');
      document.querySelector('.form .form__fieldset--checkbox').style.display = 'none';
    }

    const card = elements.create('card', {style}, {hidePostalCode: true});

    card.mount('#card-element');

    const errorElement = document.getElementById('card-errors');

    card.addEventListener('change', ({error}) => {
      if (error) {
        errorElement.textContent = errorMessages[error.code];
      } else {
        errorElement.textContent = '';
      }
    });

    const form = document.getElementById('payment-form');
    const submitButton = document.getElementById('form-submit-button');
    const buyMoreButton = document.querySelector('.checkout__button-buy-more');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const {token, error} = await stripe.createToken(card);
      submitButton.disabled = false;
      form.classList.add('form--loading');

      if (error) {
        errorElement.textContent = errorMessages[error.code];
        form.classList.remove('form--loading');
      } else {
        errorElement.textContent = '';
        const response = await stripeTokenHandler(token);
        const feedbackMessage = document.querySelector('.checkout__skus');
        form.classList.remove('form--loading');
        form.classList.add('form--hidden');
        console.log(response);
        const result = await response.json();
        if (response.ok) {
          console.warn('ok');
          console.log('success: ', result);
          feedbackMessage.innerText = 'Оплата прошла успешно!';
          buyMoreButton.style.display = 'inline-block';
        } else {
          console.warn('not ok');
          console.log('error: ', result);
          const errorMessage = errorMessages[result] || '';
          feedbackMessage.innerText = `Мастер-класс не оплачен. ${errorMessage}`;
          buyMoreButton.innerText = 'Попробовать еще';
          buyMoreButton.style.display = 'inline-block';
          throw new Error(`${response.status} ${response.statusText}`);
        }
      }
    });

    buyMoreButton.addEventListener('click', () => {
      form.classList.remove('form--hidden');
      buyMoreButton.style.display = 'none';
    });

    const stripeTokenHandler = async (token) => {
      const response = await fetch('/skus');
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const sku = await response.json();
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const phone = document.getElementById('form-tel').value;
      const subscription = document.getElementById('form-subscription-checkbox').checked;
      const submitResponse = fetch('/submit-payment', {
        method: 'POST'
        , body: JSON.stringify({name, email, phone, sku, token, subscription})
        , headers: {'content-type': 'application/json'}
      });
      return submitResponse;
    };
  }
}
