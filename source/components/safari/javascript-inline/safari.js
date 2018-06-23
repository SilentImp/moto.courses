
if (window.PaymentRequest) {  
  
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
      amount: '40'
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
  
  request.onpaymentauthorized = async function(event) {
    console.warn('onpaymentauthorized');
    console.warn(event);
  }

  const button = document.getElementById('pay-safari');
  button.addEventListener('click', async function (event) {
    console.log('clicked');
    console.log('paymentDetails: ', paymentDetails);
    
    if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
      const sessionResult = new ApplePaySession(3, paymentDetails);
    }
    
    const result = await request.show();
    console.warn('result: ', result);
    setTimeout(function(){result.complete('success');}, 5000);
  });

}