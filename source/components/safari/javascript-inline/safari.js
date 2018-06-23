let session;

  const applePayMethod = {
    supportedMethods: "https://apple.com/apple-pay",
    data: {
        version: 3,
        merchantIdentifier: "merchant.moto.courses",
        merchantCapabilities: ["supports3DS", "supportsCredit", "supportsDebit"],
        supportedNetworks: ["amex", "discover", "masterCard", "visa"],
        countryCode: "UA",
        currencyCode: 'UAH',
    },
  };
  
  const paymentDetails = {
    countryCode: 'UA',
    currencyCode: 'UAH',
    merchantCapabilities: ["supports3DS", "supportsCredit", "supportsDebit"],
    supportedNetworks: ["amex", "discover", "masterCard", "visa"],
    total: {
      amount: { value: "10.00", currency: "UAH" }
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
  
  const button = document.getElementById('pay-safari');
  button.addEventListener('click', async (event) => {
    console.log('clicked');
    console.log('paymentDetails: ', paymentDetails);
      
    console.log('session: ', session);
      
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
      return event.complete(response.json());
    };

    request.onpaymentauthorized = async function(event) {
      console.warn('onpaymentauthorized');
      console.warn(event);
    }

    const response = await request.show();
    response.complete("success");

  });
  
  
  const buttonA = document.getElementById('pay-apple');
  buttonA.addEventListener('click', async (event) => {
    session = new window.ApplePaySession(1, {
      countryCode: 'US',
      currencyCode: 'USD',
      merchantCapabilities: ["supports3DS", "supportsCredit", "supportsDebit"],
      supportedNetworks: ["masterCard", "visa"],
      total: {
        amount: 50
        , label: 'maintenance.course'
      },
    });
    session.onvalidatemerchant = function (event) {
      console.warn('onmerchantvalidation apple');
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
      return event.complete(response.json());
    };
    session.begin();
  });