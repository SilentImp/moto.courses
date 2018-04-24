export default class Form {
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
    const feedback = document.getElementById('form-feedback');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const {token, error} = await stripe.createToken(card);

      if (error) {
        errorElement.textContent = errorMessages[error.code];
      } else {
        errorElement.textContent = '';
        const response = await stripeTokenHandler(token);
        const feedbackMessage = document.getElementById('form-feedback-message');
        feedback.classList.add('form__feedback--visible');
        if (!response.ok) {
          feedbackMessage.innerText = 'Что-то пошло не так';
          submitButton.disabled = false;
          form.classList.remove('form--loading');
          throw new Error(`${response.status} ${response.statusText}`);
        } else {
          form.reset();
          card.clear();
          form.classList.remove('form--loading');
          submitButton.disabled = false;
          feedbackMessage.innerText = 'Оплата прошла успешно!';
        }
      }
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
      const submitResponse = fetch('/submit-payment', {
        method: 'POST'
        , body: JSON.stringify({name, email, phone, sku, token})
        , headers: {'content-type': 'application/json'}
      });
      form.classList.add('form--loading');
      submitButton.disabled = true;
      return submitResponse;
    };

    document.getElementById('form-close-feedback-button').addEventListener('click', () => {
      feedback.classList.remove('form__feedback--visible');
    });
  }
}
