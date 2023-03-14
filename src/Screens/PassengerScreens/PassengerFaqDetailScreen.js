import React from 'react';
import {View, Text,StyleSheet} from 'react-native';
import PassengerFaqContent from '../../Helper/PassengerFaqContent';
import CustomHeader from '../../Components/CustomHeader';
import COLORS from '../../Constants/Colors';

function PassengerFaqDetail({navigation,route}) {

    let data = route.params
    console.log(data,"data")
    console.log(PassengerFaqContent,"passenger")

  return (
    <View>
      <View style={styles.headerContainer}>
        <CustomHeader
          iconname={'arrow-back'} 
          color={COLORS.white}
          onPress={() => {
            navigation.goBack();
          }}
          source={require('../../Assets/Images/URWhiteLogo.png')}
        />
      </View>
        <Text style={styles.heading} >
            {data.toUpperCase()}
        </Text>
        <Text style={styles.text} > 
            {data == "driver Do not Respond" ? PassengerFaqContent.driverDonotRespond : data=="How To Leave A Review for a driver" ? PassengerFaqContent.howToLeaveAReviewForTheDriver : data == "How to Complain" ? PassengerFaqContent.howToComplain : PassengerFaqContent.howToFindBelongings  }
        </Text>
        <Text style={styles.text} > 
            {data == "How to Complain" && PassengerFaqContent.howToComplain2 }
        </Text>
    </View>
  );
}

export default PassengerFaqDetail;

const styles = StyleSheet.create({
    container: {
      backgroundColor: COLORS.white,
      height: '100%',
    },
    headerContainer: {
      backgroundColor: COLORS.secondary,
      zIndex: 1,
    },
    heading: {
      color: COLORS.black,
      fontSize: 24,
      paddingHorizontal: 20,
      paddingTop : 20,
      fontWeight:"800"
    },
    text : {
        color:COLORS.black,
        fontSize:18,
        fontWeight:"600",
        padding:20

    }
    
    
  });