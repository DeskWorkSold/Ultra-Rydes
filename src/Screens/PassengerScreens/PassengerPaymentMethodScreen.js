import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import Colors from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import CustomButton from '../../Components/CustomButton';
import {Dimensions} from 'react-native';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import CustomCard from '../../Components/customCard';
import {useState} from 'react';
import PassengerCheckOutScreen from './passengerCheckOutScreen';
import {ToastAndroid} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useEffect} from 'react';
import {load} from 'npm';

function PaymentMethod({navigation, route}) {
  const [savedCards, setSavedCards] = React.useState(true);
  const [loader, setLoader] = React.useState(false);

  const [cardDetail, setCardDetail] = useState({
    cardHolderName: '',
    cardNumber: null,
    expiryYear: null,
    expiryMonth: null,
    cvc: null,
  });

  let data = route.params;

  const [savedCardsData, setSavedCardsData] = useState([
    // {
    //   PaymentMethod: 'Credit Card',
    //   cardHolderName: 'John R Halton',
    //   cardNumber: '5282 3456 7890 1289',
    //   cardDate: '09/25',
    //   cvc: '1234',
    // },
    // {
    //   PaymentMethod: 'Credit Card',
    //   cardHolderName: 'John R Halton',
    //   cardNumber: '5282 3456 7890 1289',
    //   cardDate: '09/25',
    //   cvc: '1234',
    // },
    // {
    //   PaymentMethod: 'Credit Card',
    //   cardHolderName: 'John R Halton',
    //   cardNumber: '5282 3456 7890 1289',
    //   cardDate: '09/25',
    //   cvc: '1234',
    // },
  ]);

  const getPassengerSavedCards = () => {
    const id = auth().currentUser.uid;
    firestore()
      .collection('passengerCards')
      .doc(id)
      .onSnapshot(querySnapshot => {
        if (querySnapshot.exists) {
          let data = querySnapshot.data().savedCards;
          data =
            data &&
            data.length > 0 &&
            data.map((e, i) => {
              e.PaymentMethod = 'Credit Card';
              return e;
            });

          setSavedCardsData(data);
        }
      });
  };

  useEffect(() => {
    getPassengerSavedCards();
  }, []);

  const getCardData = () => {
    setLoader(true);
    let values = Object.values(cardDetail);
    console.log(values, 'bales');
    let flag = values.some(e => e == '');
    if (flag) {
      ToastAndroid.show('Required fields are missing', ToastAndroid.SHORT);
    } else {
      let id = auth().currentUser.uid;

      let savedCards = {
        ...cardDetail,
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
          setLoader(false);
          ToastAndroid.show(
            'Card has been successfully added',
            ToastAndroid.SHORT,
          );
          setSavedCards(true);
        })
        .catch(error => {
          setLoader(false);
          console.log(error);
        });
    }
  };

  console.log(savedCardsData, 'saved');

  const getSelectedCard = (selectedCard, ind) => {
    setSavedCardsData(
      savedCardsData &&
        savedCardsData.length > 0 &&
        savedCardsData.map((e, i) => {
          if (ind == i) {
            return {
              ...e,
              default: true,
            };
          } else {
            return {
              ...e,
              default: false,
            };
          }
        }),
    );
  };

  const routeToCheckOutScreen = async () => {
    let flag = savedCardsData.some((e, i) => e.default);

    console.log(flag, 'flag');
    if (!flag) {
      ToastAndroid.show('Kindly select card', ToastAndroid.SHORT);
      return;
    }

    console.log(savedCards, 'saved');

    setLoader(true);

    let id = auth().currentUser.uid;
    firestore()
      .collection('passengerCards')
      .doc(id)
      .set({savedCards: savedCardsData})
      .then(res => {
        ToastAndroid.show(
          'This card has been successfully set to default',
          ToastAndroid.SHORT,
        );
        setLoader(false);
      })
      .catch(error => {
        ToastAndroid.show(
          'Internal Server Error Unsuccessfull to set card to default',
          ToastAndroid.SHORT,
        );
        setLoader(false);
      });
  };

  return (
    <View style={{height: '100%'}}>
      <ScrollView>
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

        {!savedCards && (
          <View>
            <Text style={styles.Heading}>Saved Cards</Text>
          </View>
        )}
        {!savedCardsData || savedCards ? (
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}
          >
            <Text
              style={[
                !savedCards ? styles.text : styles.Heading,
                {
                  width: savedCards ? '55%' : '65%',
                  textAlign: 'left',
                  marginLeft: 10,
                  fontWeight: '400',
                },
              ]}
            >
              {savedCards
                ? 'Saved Cards'
                : 'Add a card to proceed payment through credit/debit card'}
            </Text>
            <CustomButton
              styleContainer={{
                marginRight: 10,
                width: savedCards ? '40%' : '32%',

                padding: 0,
              }}
              onPress={() => setSavedCards(false)}
              btnTextStyle={{fontSize: savedCards ? 14 : 16}}
              text={savedCards ? 'Add New card' : 'Add card'}
            />
          </View>
        ) : (
          <CustomCard
            PaymentMethod={'Credit Card'}
            cardHolderName="Add a new Card"
            cardNumber="XXXX XXXX XXXX XXXX"
            cardDate="9/25"
            source={require('../../Assets/Images/masterCard.png')}
          />
        )}

        {!savedCards ? (
          <View style={{width: '100%', paddingHorizontal: 20, marginTop: 30}}>
            <View style={{width: '95%'}}>
              <Text style={[styles.text, {textAlign: 'left'}]}>
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
                  color: 'black',
                  borderWidth: 1,
                  borderColor: Colors.black,
                  padding: 10,
                  borderRadius: 10,
                  marginTop: 5,
                }}
              />
            </View>
            <View style={{width: '95%', marginTop: 10}}>
              <Text style={[styles.text, {textAlign: 'left'}]}>
                Card Number
              </Text>
              <TextInput
                placeholder="Enter card number..."
                keyboardType="number-pad"
                onChangeText={e =>
                  setCardDetail({...cardDetail, cardNumber: e})
                }
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
            <View style={{width: '95%', marginTop: 10}}>
              <Text style={[styles.text, {textAlign: 'left'}]}>
                Expiry Month
              </Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={e =>
                  setCardDetail({...cardDetail, expiryMonth: e})
                }
                placeholder="Enter expiry date..."
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
            <View style={{width: '95%', marginTop: 10}}>
              <Text style={[styles.text, {textAlign: 'left'}]}>
                Expiry Year
              </Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={e =>
                  setCardDetail({...cardDetail, expiryYear: e})
                }
                placeholder="Enter expiry date..."
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
            <View style={{width: '95%', marginTop: 10}}>
              <Text style={[styles.text, {textAlign: 'left'}]}>CVC</Text>
              <TextInput
                placeholder="Enter cvc..."
                keyboardType="number-pad"
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
            </View>
          </View>
        ) : (
          <ScrollView horizontal={true} style={{marginTop: 20}}>
            {savedCardsData &&
              savedCardsData.length > 0 &&
              savedCardsData.map((e, i) => {
                return (
                  <CustomCard
                    PaymentMethod="Credit Card"
                    source={require('../../Assets/Images/masterCard.png')}
                    cardHolderName={e.cardHolderName}
                    cardNumber={e.cardNumber}
                    cardDate={`${e.expiryMonth}/${e.expiryYear}`}
                    selected={e?.default}
                    onPress={() => getSelectedCard(e, i)}
                  />
                );
              })}
          </ScrollView>
        )}
        <View
          style={{
            alignItems: 'center',

            marginTop: 20,
            marginBottom: 10,
            width: '100%',
          }}
        >
          {!savedCards && (
            <CustomButton
              styleContainer={{marginRight: 10, width: '90%'}}
              text={
                loader ? (
                  <ActivityIndicator size={'large'} color={Colors.black} />
                ) : (
                  'Add card'
                )
              }
              onPress={() => getCardData()}
            />
          )}
          {savedCards && savedCardsData && savedCardsData.length > 0 && (
            <CustomButton
              styleContainer={{
                marginRight: 10,
                width: '90%',
                marginTop: Dimensions.get('window').height / 2.5,
              }}
              text={
                loader ? (
                  <ActivityIndicator size={'large'} color={Colors.black} />
                ) : (
                  'Make Default'
                )
              }
              onPress={() => routeToCheckOutScreen()}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default PaymentMethod;

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
