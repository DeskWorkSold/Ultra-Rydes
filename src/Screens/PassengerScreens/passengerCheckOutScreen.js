import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import CustomCard from '../../Components/customCard';
import {useState, useEffect} from 'react';
import CustomButton from '../../Components/CustomButton';

function PassengerCheckOutScreen({navigation, route}) {
  let data = route.params;

  console.log(data, 'data');

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
          cardNumber={selectedData?.cardNumber}
          cardDate={selectedData?.expiryDate}
        />
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          marginTop: 30,
        }}>
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
        }}>
        <Text style={styles.text}>Tax Amount</Text>
        <Text style={[styles.text, {color: Colors.secondary}]}>0$</Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          marginTop: 10,
        }}>
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
        }}>
        <CustomButton
          styleContainer={{marginRight: 10, width: '90%'}}
          text={'Pay Amount'}
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
