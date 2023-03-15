const functions = require("firebase-functions");
const stripe = require("stripe")('sk_test_51MlBs3BwiLSND57HSOb5psLqGVLqcLOUxhWYUge3XXhv1AagBkspsx9m3ajgo5BhwKe1bezelMCfQsm1wxY1ZrLT0043McZDy2')
// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
exports.stripe  = functions.https.onRequest(async (request, response) => {
    
    
    const customer = await stripe.customers.create()
    const ephemeralKey = await stripe.ephemeralKey.create(
        {customer : customer.id}
    );
    const paymentIntent = stripe.paymentIntent.create({
        amount : 1099,
        current : "usd",
        customer : customer.id
    })

    console.log(customer,"customer")
    
});
