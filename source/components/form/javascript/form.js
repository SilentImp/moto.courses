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
};

const card = elements.create('card', {style});

card.mount('#card-element');

card.addEventListener('change', ({error}) => {
  const displayError = document.getElementById('card-errors');
  if (error) {
    displayError.textContent = error.message;
  } else {
    displayError.textContent = '';
  }
});

const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const {token, error} = await stripe.createToken(card);

  if (error) {
    const errorElement = document.getElementById('card-errors');
    errorElement.textContent = error.message;
  } else {
    const response = await stripeTokenHandler(token);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  }
});

const stripeTokenHandler = async (token) => {
  const response = await fetch('/skus');
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const sku = await response.json();
  const formData = new FormData(document.getElementById('payment-form'));
  const name = formData.get('name');
  const email = formData.get('email');
  const submitResponse = fetch('/submit-payment', {
    method: 'POST'
    , body: JSON.stringify({name, email, sku, token})
   , headers: {'content-type': 'application/json'}
  });
  if (!submitResponse.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
};
