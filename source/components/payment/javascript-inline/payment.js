const methodData = [{
  supportedMethods: 'basic-card'
}];

const applePayMethod = {
  supportedMethods: 'https://apple.com/apple-pay'
  , data: {
    version: 3
        , merchantIdentifier: 'merchant.com.example'
      , merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit']
        , supportedNetworks: ['amex', 'discover', 'masterCard', 'visa']
        , countryCode: 'US'
  }
};

const debitModifier = {
  supportedMethods: 'https://apple.com/apple-pay'
  , data: { paymentMethodType: 'debit' }
    , total: {
      label: 'My Merchant'
      , amount: { value: '26.50', currency: 'USD' }
    }
    , additionalDisplayItems: [{
      label: 'Debit Card Discount'
      , amount: { value: '-1.00', currency: 'USD' }
    }]
};

const options = {
  requestPayerEmail: false
  , requestPayerName: false
  , requestPayerPhone: false
  , requestShipping: false
};

const details = {
  total: {label: 'Donation', amount: {currency: 'USD', value: '55.00'}}
  , displayItems: [
    {
      label: 'Original donation amount'
      , amount: {currency: 'USD', value: '65.00'}
    }
    , {
      label: 'Friends and family discount'
      , amount: {currency: 'USD', value: '-10.00'}
    }
  ]
};

try {
  let firefoxRequest = new window.PaymentRequest(methodData, details, options);
  let appleRequest = new window.PaymentRequest([applePayMethod], details, options);

  document.getElementById('payme').addEventListener('click', async () => {
    try {
      const response = await appleRequest.show();
      console.log(response);
    } catch (error) {
      console.log('apple faile: ', error);
      try {
        await firefoxRequest.show();
      } catch (error) {
        console.log('ff fail', error);
      }
    }

    try {
      const request = new window.PaymentRequest(methodData, details, options);
    } catch (error) {
      console.log('cant restore: ', error);
    }
  });
} catch (error) {
  console.log('no PaymentRequest: ', error);
}
