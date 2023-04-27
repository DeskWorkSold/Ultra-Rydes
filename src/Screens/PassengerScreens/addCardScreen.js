import React, {useState} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Colors from '../../Constants/Colors';
import CustomButton from '../../Components/CustomButton';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {sexagesimalToDecimal} from 'geolib';

function AddCard({navigation}) {
  const [cardDetail, setCardDetail] = useState({
    cardHolderName: '',
    cardNumber: null,
    expiryYear: null,
    expiryMonth: null,
    cvc: null,
  });
  const [loading, setLoading] = useState(false);

  const saveCard = () => {
    let values = Object.values(cardDetail);

    let flag = values.some(e => e == '');
    if (flag) {
      ToastAndroid.show('Required fields are missing', ToastAndroid.SHORT);
    } else {
      setLoading(true);

      let id = auth().currentUser.uid;

      let savedCards = {
        ...cardDetail,
        default: true,
        date: new Date(),
      };
      firestore()
        .collection('passengerCards')
        .doc(id)
        .set(
          {
            savedCards: firestore.FieldValue.arrayUnion(savedCards),
          },
          {merge: true},
        )
        .then(() => {
          setLoading(false);
          ToastAndroid.show(
            'Card has been successfully added',
            ToastAndroid.SHORT,
          );
          firestore().collection('Passengers').doc(id).update({
            paymentCardAdd: true,
          });
        })
        .catch(error => {
          setLoading(false);
          console.log(error);
        });
    }
  };

  return (
    <View style={{width: '100%', paddingHorizontal: 20, marginTop: 30}}>
      <ScrollView>
        <View style={{width: '100%'}}>
          <Text
            style={[
              styles.text,
              {
                textAlign: 'center',
                fontSize: 24,
                fontWeight: '600',
                marginBottom: 0,
                color: Colors.secondary,
              },
            ]}
          >
            Add Your Card Details
          </Text>
          <Text
            style={[
              styles.text,
              {
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 10,
                color: Colors.primary,
              },
            ]}
          >
            This card will be used for future payments
          </Text>
          <Text
            style={[
              styles.text,
              {
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 20,
                color: Colors.black,
              },
            ]}
          >
            This card will be your default payment card which you will be able
            to change anytime.
          </Text>

          <Text
            style={[styles.text, {textAlign: 'left', color: Colors.secondary}]}
          >
            Card Holder Name
          </Text>
          <TextInput
            onChangeText={e =>
              setCardDetail({...cardDetail, cardHolderName: e})
            }
            placeholder="Enter name..."
            placeholderTextColor={Colors.black}
            style={{
              width: '100%',
              color: Colors.black,
              borderWidth: 1,
              borderColor: Colors.black,
              padding: 10,
              borderRadius: 10,
              marginTop: 5,
            }}
          />
        </View>
        <View style={{width: '100%', marginTop: 10}}>
          <Text
            style={[styles.text, {textAlign: 'left', color: Colors.secondary}]}
          >
            Card Number
          </Text>
          <TextInput
            placeholder="Enter card number..."
            keyboardType="numeric"
            onChangeText={e => setCardDetail({...cardDetail, cardNumber: e})}
            placeholderTextColor={Colors.black}
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: Colors.black,
              padding: 10,
              color: 'black',
              borderRadius: 10,
              marginTop: 5,
            }}
          />
        </View>
        <View style={{width: '100%', marginTop: 10}}>
          <Text
            style={[styles.text, {textAlign: 'left', color: Colors.secondary}]}
          >
            Expiry Month
          </Text>
          <TextInput
            keyboardType="numeric"
            onChangeText={e => setCardDetail({...cardDetail, expiryMonth: e})}
            placeholder="Enter expiry month..."
            placeholderTextColor={Colors.black}
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: Colors.black,
              padding: 10,
              color: 'black',
              borderRadius: 10,
              marginTop: 5,
            }}
          />
        </View>
        <View style={{width: '100%', marginTop: 10}}>
          <Text
            style={[styles.text, {textAlign: 'left', color: Colors.secondary}]}
          >
            Expiry Year
          </Text>
          <TextInput
            keyboardType="numeric"
            onChangeText={e => setCardDetail({...cardDetail, expiryYear: e})}
            placeholder="Enter expiry year..."
            placeholderTextColor={Colors.black}
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: Colors.black,
              padding: 10,
              color: 'black',
              borderRadius: 10,
              marginTop: 5,
            }}
          />
        </View>
        <View style={{width: '100%', marginTop: 10}}>
          <Text
            style={[styles.text, {textAlign: 'left', color: Colors.secondary}]}
          >
            CVC
          </Text>
          <TextInput
            placeholder="Enter cvc..."
            keyboardType="numeric"
            onChangeText={e => setCardDetail({...cardDetail, cvc: e})}
            placeholderTextColor={Colors.black}
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: Colors.black,
              padding: 10,
              color: 'black',
              borderRadius: 10,
              marginTop: 5,
            }}
          />
          <CustomButton
            styleContainer={{width: '100%', marginTop: 20}}
            text={
              loading ? (
                <ActivityIndicator size={'small'} color={'black'} />
              ) : (
                'Save Card'
              )
            }
            onPress={() => saveCard()}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '45%',
  },
  btnTextStyle: {
    fontSize: 15,
    textAlign: 'center',
    margin: 5,
    color: '#ffffff',
    backgroundColor: 'transparent',
    fontFamily: 'Poppins-Medium',
  },
  btnContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    padding: 10,
  },
  container: {
    flex: 1,
  },
  cancelTextContainer: {
    marginRight: 5,
  },
  cancelText: {
    color: Colors.red,
    marginRight: 5,
  },
  card: {
    width: '95%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    margin: 5,
    // borderWidth: 1,
    padding: 5,
    borderRadius: 20,
    elevation: 5,
  },
  driverNameText: {
    fontSize: 15,
    color: Colors.black,
  },
  innerItemsUpper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imgContainer: {
    flexDirection: 'row',
  },
  proPic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'red',
    margin: 5,
  },
  priceContainer: {
    marginRight: 5,
  },
  priceText: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  vehText: {
    fontSize: 18,
    color: Colors.black,
    fontFamily: 'Poppins-Medium',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.secondary,
    width: '80%',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '90%',
    color: 'white',
    borderWidth: 1,
    borderColor: 'white',
  },
  buttonOpen: {
    backgroundColor: '#white',
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '800',
    color: 'white',
  },
});

export default AddCard;
