import {View, Text, TouchableOpacity, Image} from 'react-native';
import COLORS from '../Constants/Colors';

function CustomCard({
  PaymentMethod,
  source,
  cardHolderName,
  cardNumber,
  cardDate,
  onPress,
  selected
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        marginTop: -20,
        marginLeft: 10,
      }}>
      <TouchableOpacity
        style={{
          width: '95%',
          backgroundColor: COLORS.white,
          paddingVertical: 20,
          elevation: 9,
          alignSelf: 'center',
          justifyContent: 'center',
          borderRadius: 20,
          marginVertical: 20,
          borderWidth : selected ? 2 : 0,
          borderColor  : selected  ? COLORS.secondary : ""
        }}
        onPress={onPress}>
        <View
          style={{
            paddingHorizontal: 20,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View>
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: COLORS.gray,
                  }}>
                  Card Holder Name
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginTop: 10,
                    color: COLORS.black,
                  }}>
                  {cardHolderName}
                </Text>
              </View>
            </View>
            <View>
              {PaymentMethod == 'Credit Card' && (
                <>
                  <Image
                    source={source}
                    resizeMode="contain"
                    style={{width: 100, height: 100}}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                    }}>
                    {PaymentMethod}
                  </Text>
                </>
              )}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View>
              <Text style={{color: COLORS.black}}>{cardNumber}</Text>
            </View>
            <View>
              <Text style={{color: COLORS.black}}>{cardDate}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default CustomCard;
