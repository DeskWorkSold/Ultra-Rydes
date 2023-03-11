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

function PaymentMethod({navigation, route}) {
  const [savedCards, setSavedCards] = React.useState(true);

  let data = route.params;

  const [savedCardsData, setSavedCardsData] = useState([
    {
      PaymentMethod: 'Credit Card',
      cardHolderName: 'John R Halton',
      cardNumber: '5282 3456 7890 1289',
      cardDate: '09/25',
      cvc: '1234',
    },
    {
      PaymentMethod: 'Credit Card',
      cardHolderName: 'John R Halton',
      cardNumber: '5282 3456 7890 1289',
      cardDate: '09/25',
      cvc: '1234',
    },
    {
      PaymentMethod: 'Credit Card',
      cardHolderName: 'John R Halton',
      cardNumber: '5282 3456 7890 1289',
      cardDate: '09/25',
      cvc: '1234',
    },
  ]);

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
          <View style={{width: '100%', paddingHorizontal: 20, marginTop: 30}}>
            <View style={{width: '95%'}}>
              <Text style={[styles.text, {textAlign: 'left'}]}>
                Card Holder Name
              </Text>
              <TextInput
                placeholder="Enter name..."
                placeholderTextColor={Colors.black}
                style={{
                  width: '100%',
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
                placeholderTextColor={Colors.black}
                style={{
                  width: '100%',
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
                Expiry Date
              </Text>
              <TextInput
                placeholder="Enter expiry date..."
                placeholderTextColor={Colors.black}
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: Colors.black,
                  padding: 10,
                  borderRadius: 10,
                  marginTop: 5,
                }}
              />
            </View>
            <View style={{width: '95%', marginTop: 10}}>
              <Text style={[styles.text, {textAlign: 'left'}]}>CVC</Text>
              <TextInput
                placeholder="Enter cvc..."
                placeholderTextColor={Colors.black}
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: Colors.black,
                  padding: 10,
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
                    cardDate={e.cardDate}
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
              onPress={() => setSavedCards(true)}
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
