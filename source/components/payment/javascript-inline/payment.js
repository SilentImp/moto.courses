const methodData = [{
  supportedMethods: "basic-card",
}];

const options = {
  requestPayerEmail: true,
  requestPayerName: true,
  requestPayerPhone: true,
  requestShipping: false,
}
const details = {
      id: "order-1",
      displayItems: [{
          label: "Волшебный говорящий медведь-проститутка",
          amount: {
            currency: "usd",
            value: "25.00"
          },
        }],
      total: {
        label: "Total",
        amount: {
          currency: "usd",
          value: "25.00"
        },
      },
    };

let request = new PaymentRequest(methodData, details, options);

document.getElementById('payme').addEventListener('click', async () => {
  const response = await request.show(); 
  console.log(response);
  request = new PaymentRequest(methodData, details, options);
});
