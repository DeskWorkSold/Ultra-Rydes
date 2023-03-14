import React from 'react';
import {View, Text,StyleSheet} from 'react-native';
import PassengerFaqContent from '../../Helper/PassengerFaqContent';
import CustomHeader from '../../Components/CustomHeader';
import COLORS from '../../Constants/Colors';
import { driverFAQ } from '../../Helper/DriverFAQContent';

function DriverFaqDetail({navigation,route}) {

    let data = route.params
    
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
            {data == "How to use the app" ? driverFAQ.howToUseTheApp : data=="Complete the trip" ? driverFAQ.completeTheTrip : data == "How to Complain" ? driverFAQ.howToComplain : data == "benefitOfUsing" ? driverFAQ.BenefitOfUsing : driverFAQ.FeaturesOfTheApp  }
        </Text>
        <Text style={styles.text} > 
            {data == "How to Complain" && driverFAQ.howToComplain2 }
        </Text>
    </View>
  );
}

export default DriverFaqDetail;

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