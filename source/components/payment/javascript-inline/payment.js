const methodData = [{
  supportedMethods: "basic-card",
}];

const options = {
  requestPayerEmail: false,
  requestPayerName: false,
  requestPayerPhone: false,
  requestShipping: false,
}

const details = {
  total: {label: 'Donation', amount: {currency: 'USD', value: '55.00'}},
  displayItems: [
    {
      label: 'Original donation amount',
      amount: {currency: 'USD', value: '65.00'},
    },
    {
      label: 'Friends and family discount',
      amount: {currency: 'USD', value: '-10.00'},
    },
  ],
};

let request = new PaymentRequest(methodData, details);

document.getElementById('payme').addEventListener('click', async () => {
  try {
    const response = await request.show(); 
    console.log(response);
  } catch(error){
    console.log(error);
  }
  
  try {
    request = new PaymentRequest(methodData, details, options);
  } catch(error){
    console.log('cant restore: ', error);
  }
});
