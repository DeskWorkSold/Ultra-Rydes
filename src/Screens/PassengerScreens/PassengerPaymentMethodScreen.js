import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
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
import {CardField, useStripe} from '@stripe/stripe-react-native';

function PaymentMethod({navigation, route}) {
  const [savedCards, setSavedCards] = React.useState(true);
  const [cardHolderName, setCardHolderName] = React.useState('');
  const [cardDetail, setCardDetail] = useState({
    complete: false,
  });

  let data = route.params;

  console.log(cardDetail, 'details');

  const [savedCardsData, setSavedCardsData] = useState([
    {
      PaymentMethod: 'Credit Card',
      cardHolderName: 'John R Halton',
      last4: '5282',
      cardDate: '09/25',
    },
    {
      PaymentMethod: 'Credit Card',
      cardHolderName: 'John R Halton',
      last4: '5282',
      cardDate: '09/25',
    },
    {
      PaymentMethod: 'Credit Card',
      cardHolderName: 'John R Halton',
      last4: '5282',
      cardDate: '09/25',
    },
  ]);

  const getPassengerSavedCards = () => {
    const id = auth().currentUser.uid;
    firestore()
      .collection('passengerCards')
      .doc(id)
      .onSnapshot(querySnapshot => {
        let data = querySnapshot.data().savedCards;
        data =
          data &&
          data.length > 0 &&
          data.map((e, i) => {
            e.PaymentMethod = 'Credit Card';
            return e;
          });

        setSavedCardsData(data);
      });
  };

  useEffect(() => {
    getPassengerSavedCards();
  }, []);

  const getCardData = () => {
    if (!cardDetail.complete || !cardHolderName) {
      ToastAndroid.show('Required fields are missing', ToastAndroid.SHORT);
    } else {
      let id = auth().currentUser.uid;
      let savedCards = {
        ...cardDetail,
        cardHolderName: cardHolderName,
        PaymentMethod: 'Credit Card',
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
          ToastAndroid.show(
            'Card has been successfully added',
            ToastAndroid.SHORT,
          );
          setSavedCards(true);
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const getSelectedCard = (selectedCard, ind) => {
    setSavedCardsData(
      savedCardsData &&
        savedCardsData.length > 0 &&
        savedCardsData.map((e, i) => {
          if (ind == i) {
            return {
              ...e,
              selected: e.selected ? false : true,
            };
          } else {
            return {
              ...e,
              selected: false,
            };
          }
        }),
    );
  };

  console.log(cardDetail, 'details');

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
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
            <Text
              style={[
                !savedCards ? styles.text : styles.Heading,
                {
                  width: savedCards ? '55%' : '65%',
                  textAlign: 'left',
                  marginLeft: 10,
                  fontWeight: '400',
                },
              ]}>
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
          <View style={{paddingHorizontal: 10}}>
            <Text style={[styles.text, {textAlign: 'left'}]}>
              Card Holder Name
            </Text>
            <TextInput
              onChangeText={e => setCardHolderName(e)}
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
            <CardField
              postalCodeEnabled={false}
              placeholders={{
                number: 'XXXX XXXX XXXX XXXX',
              }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#000000',
                placeholderColor: 'black',
              }}
              style={{
                width: '100%',
                height: 50,
                marginVertical: 30,
              }}
              onCardChange={cardDetails => {
                setCardDetail(cardDetails);
              }}
              onFocus={focusedField => {
                console.log('focusField', focusedField);
              }}
            />
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
                    cardNumber={`XXXX XXXX XXXX ${e.last4}`}
                    cardDate={`${e.expiryMonth}/${e.expiryYear}`}
                    selected={e?.selected}
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
          }}>
          {!savedCards && (
            <CustomButton
              styleContainer={{marginRight: 10, width: '90%'}}
              text={'Add card'}
              onPress={() => getCardData()}
            />
          )}
          {savedCards && savedCardsData && (
            <CustomButton
              styleContainer={{marginRight: 10, width: '90%', marginTop: 290}}
              text={'Check Out'}
              onPress={() =>
                navigation.navigate('passengerCheckoutScreen', {
                  cardData: savedCardsData,
                  amount: route.params,
                })
              }
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
