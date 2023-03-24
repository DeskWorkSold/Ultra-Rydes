import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
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
import {BASE_URI} from '../../Constants/Base_uri';

function PassengerCheckOutScreen({navigation, route}) {
  let data = route.params;

  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

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

  const handlePayPress = async () => {
    setLoading(true);
    let customerData = {
      cardNumber: selectedData.cardNumber,
      expiryMonth: Number(selectedData.expiryMonth),
      expiryYear: Number(selectedData.expiryYear),
      cvc: selectedData.cvc,
      amount: Number(data.amount),
    };
    axios
      .post(`${BASE_URI}dopayment`, customerData)
      .then(res => {
        setLoading(false);
        let data = res.data;
        console.log(typeof data.amount);
        let {result, status} = data;
        if (!status) {
          ToastAndroid.show(data.message, ToastAndroid.SHORT);
          return;
        }
        let walletData = {
          payment: result.amount / 100,
          fare: 0,
          wallet: result.amount / 100,
          date: new Date(),
          tip: 0,
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
            navigation.navigate('AskScreen');
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
        setLoading(false);
        ToastAndroid.show('error', ToastAndroid.SHORT);
      });
  };
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
          text={
            loading ? (
              <ActivityIndicator size="large" color={Colors.secondary} />
            ) : (
              'Pay Amount'
            )
          }
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
