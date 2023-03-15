import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import CustomCard from '../../Components/customCard';
import {useState, useEffect} from 'react';
import CustomButton from '../../Components/CustomButton';
import axios from 'axios';
import {useStripe} from '@stripe/stripe-react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {ToastAndroid} from 'react-native';

function PassengerCheckOutScreen({navigation, route}) {
  let data = route.params;
  const {confirmPayment} = useStripe();

  console.log(data, 'data');

  const {cardData} = data;

  // stripe.setOptions({
  //   publishableKey: 'pk_test_51MlBs3BwiLSND57HpBg14bqerhhXFG1x64dp4fXdnYttyEhBzfOljKeoMzDWJchdnmWTF6OClLF1AheuMu3hJ0Zw00xUWGJxXI',
  // });

  const [selectedData, setSelectedData] = useState([]);

  useEffect(() => {
    data &&
      data.cardData &&
      data.cardData.length > 0 &&
      data.cardData.filter((e, i) => {
        if (e.selected) {
          setSelectedData(e);
        }
      });
  }, []);

  console.log(data, 'data');
  console.log(typeof data.amount, 'data');

  const handlePayPress = async () => {
    let customerData = {
      cardNumber: selectedData.cardNumber,
      expiryMonth: selectedData.expiryMonth,
      expiryYear: selectedData.expiryYear,
      cvc: selectedData.cvc,
      amount: Number(data.amount),
    };

    axios
      .post('http:192.168.100.45:3000/api/dopayment', customerData)
      .then(res => {
        let data = res.data;
        console.log(data, 'data');
        console.log(data.paid, 'paid');

        let walletData = {
          payment: data.amount / 100,
          fare: 0,
          wallet: data.amount / 100,
          date: new Date(),
        };

        let id = auth().currentUser.uid;
        firestore()
          .collection('wallet')
          .doc(id)
          .set(
            {
              wallet: firestore.FieldValue.arrayUnion(walletData),
            },
            {merge: true},
          )
          .then(() => {
            ToastAndroid.show(
              'Amount Successfully Deposit in your wallet',
              ToastAndroid.SHORT,
            );
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        ToastAndroid.show('error', ToastAndroid.SHORT);
      });

    // const response = await fetch('http:192.168.100.45:3000/api/dopayment', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: {
    //     amount: 1000, // Amount in cents
    //     token: {
    //       number: "4242 4242 4242 4242",
    //       exp_month: 11,
    //       exp_year: 2022,
    //       cvc : '123'
    //     },
    //   }
    // }).then((res)=>{
    //   console.log(res)
    // }).catch((error)=>{
    //   console.log(error)
    // })

    // axios.post("https://us-central1-ultrarydes.cloudfunctions.net/stripe").then((res)=>{
    //   console.log(res)
    // }).catch((error)=>{
    //   console.log(error)
    // })

    // let data = JSON.stringify({
    //   type: 'Card',
    //   billingDetails: {
    //     email: 'jane.doe@example.com',
    //     name: 'Jane Doe',
    //   },
    //   card: {
    //     number: '4242 4242 4242 4242',
    //     expMonth: 4,
    //     expYear: 2023,
    //     cvc: "123",
    //   },
    // })

    // const { error, paymentMethod } = await confirmPayment(data);

    // if (error) {
    //   console.error(error,"error");
    // } else {
    //   // Payment succeeded, handle success state
    //   console.log(paymentMethod,"payment")
    // }

    // const cardDetails = {
    //   number: '4242424242424242',
    //   expMonth: 11,
    //   expYear: 23,
    //   cvc: '123',
    // };

    // const paymentMethod = await stripe.createPaymentMethod({
    //   type: 'card',
    //   card: cardDetails,
    // });

    // const paymentIntent = await stripe.confirmPayment({
    //   paymentMethodId: paymentMethod.id,
    //   amount: 1000,
    //   currency: 'usd',
    //   confirm: true,
    // });

    // if (paymentIntent.status === 'succeeded') {
    //   console.log('Payment succeeded!');
    // } else if (paymentIntent.status === 'requires_action') {
    //   console.log('Payment requires additional action to complete.');
    // } else {
    //   console.log('Payment failed.');
    // }
  };

  console.log(selectedData, 'selected');

  return (
    <View style={{height: '100%'}}>
      <View style={styles.headerContainer}>
        <CustomHeader
          iconname={'arrow-back'}
          color={Colors.white}
          onPress={() => {
            navigation.goBack();
          }}
          source={require('../../Assets/Images/URWhiteLogo.png')}
        />
      </View>

      <Text style={styles.Heading}>Check out</Text>

      {selectedData && (
        <CustomCard
          PaymentMethod="Credit Card"
          source={require('../../Assets/Images/masterCard.png')}
          cardHolderName={selectedData?.cardHolderName}
          cardNumber={`${selectedData?.cardNumber}`}
          cardDate={`${selectedData?.expiryMonth}/${selectedData?.expiryYear}`}
        />
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          marginTop: 30,
        }}
      >
        <Text style={styles.text}>Deposit Amount</Text>
        <Text style={[styles.text, {color: Colors.secondary}]}>
          {data.amount}$
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          marginTop: 20,
          borderBottomColor: 'black',
          borderBottomWidth: 1,
          paddingBottom: 10,
        }}
      >
        <Text style={styles.text}>Tax Amount</Text>
        <Text style={[styles.text, {color: Colors.secondary}]}>0$</Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          marginTop: 10,
        }}
      >
        <Text style={styles.text}>Total Deposit</Text>
        <Text style={[styles.text, {color: Colors.secondary, fontSize: 16}]}>
          {data.amount}$
        </Text>
      </View>
      <View
        style={{
          alignItems: 'center',
          position: 'absolute',
          bottom: 20,
          width: '100%',
        }}
      >
        <CustomButton
          styleContainer={{marginRight: 10, width: '90%'}}
          text={'Pay Amount'}
          onPress={handlePayPress}
        />
      </View>
    </View>
  );
}

export default PassengerCheckOutScreen;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.secondary,
    zIndex: 1,
  },
  Heading: {
    color: Colors.secondary,
    fontSize: 28,
    fontWeight: '900',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  text: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
