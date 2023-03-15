const functions = require("firebase-functions");
const stripe = require("stripe")('sk_test_51MlBs3BwiLSND57HSOb5psLqGVLqcLOUxhWYUge3XXhv1AagBkspsx9m3ajgo5BhwKe1bezelMCfQsm1wxY1ZrLT0043McZDy2')
// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
exports.stripe  = functions.https.onRequest(async (request, response) => {
    
    // response.set('Access-Control-Allow-Origin', '*');
    // response.set('Access-Control-Allow-Methods', 'GET, POST');

    let amount = request.params

    console.log(amount,"amount")
    

    const customer = await stripe.customers.create()
    const ephemeralKey = await stripe.ephemeralKey.create(
        {customer : customer.id}
    );

    const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2023,
          cvc: '123',
        },
      });
      

    const paymentIntent = stripe.paymentIntent.create({
        amount : 1099,
        current : "usd",
        paymentMethodId : paymentMethod.id,
        confirm : true
    })

    const clientSecret = paymentIntent.client_secret

    response.json({
        clientSecret : customer.id
    })
    
});
