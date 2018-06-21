if (window.ApplePaySession && ApplePaySession.canMakePayments() && window.PaymentRequest) {
  // we may pay with payment request API
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
  request.onmerchantvalidation = function (event) {
    console.log('onmerchantvalidation validation');
    // const sessionPromise = fetchPaymentSession(event.validationURL);
    event.complete(Math.riound(Math.random())? 'success' : 'fail');
  };
  // request.onmerchantvalidation = event => {
      // fetch("merchant-validation.php", {
      //     body: JSON.stringify({ validationURL: event.validationURL }),
      //     method: "POST",
      // }).then(response => event.complete(response.json()));
  // };
  const result = request.show();
  console.warn('result: ', result);
}