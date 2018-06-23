  const applePayMethod = {
    supportedMethods: "https://apple.com/apple-pay",
    data: {
        version: 3,
        merchantIdentifier: "merchant.moto.courses",
        merchantCapabilities: ["supports3DS", "supportsCredit", "supportsDebit"],
        supportedNetworks: ["amex", "discover", "masterCard", "visa"],
        countryCode: "US",
    },
  };
  
  const paymentDetails = {
    total: {
      amount: { value: "10", currency: "UAH" }
      , label: 'maintenance.course'
    },
  };
  
  const paymentOptions = {
    requestPayerName: true,
    requestPayerEmail: true,
    requestPayerPhone: true,
    requestShipping: false,
  };

  const request = new PaymentRequest([applePayMethod, {
    supportedMethods: 'basic-card'
  }], paymentDetails, paymentOptions);
  
  request.onmerchantvalidation = async function (event) {
    console.warn('onmerchantvalidation');
    console.warn(event);
    const response = await fetch('/validate', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      json: true,
      body: JSON.stringify({ validationURL: event.validationURL }),
    });
    if (response.ok) {
      return event.complete(response.json());
    }
    throw new Error(`${response.status} ${response.statusText}`);
  };
  
  session.onpaymentauthorized = async function(event) {
    console.warn('onpaymentauthorized');
    console.warn(event);
  }

  const button = document.getElementById('pay-safari');
  button.addEventListener('click', function (event) {
    console.log('clicked');
    const result = request.show();
    console.warn('result: ', result);
  });
