if (window.ApplePaySession && ApplePaySession.canMakePayments() && window.PaymentRequest) {

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

  const request = new PaymentRequest([applePayMethod], paymentDetails, paymentOptions);
  
  request.onmerchantvalidation = async function (event) {
    console.log('onmerchantvalidation validation');
    const response = await fetch('/validate', {
      body: JSON.stringify({ validationURL: event.validationURL }),
      method: 'POST',
    });
    if (response.ok) {
      return event.complete(response.json());
    }
    throw new Error(`${response.status} ${response.statusText}`);
  };

  const button = document.getElementById('pay-safari');
  button.addEventListener('click', function (event) {
    console.log('clicked');
    const result = request.show();
    console.warn('result: ', result);
  });
  
}