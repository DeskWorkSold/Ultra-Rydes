import React from 'react'
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native'
import CustomHeader from '../../Components/CustomHeader'
import Colors from '../../Constants/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackActions, useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth'

export default function SettingsDriver() {
    const navigation = useNavigation();
    const signOutHandler = async () => {
        await auth()
            .signOut()
            .then(() => navigation.dispatch(StackActions.replace('GetStartedScreen')))
    }
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <CustomHeader iconname={'menu'} color={Colors.white} onPress={() => { navigation.toggleDrawer(); }}
                    source={require('../../Assets/Images/whiteLogoFinal.png')}
                /></View>
            <View style={styles.fieldItemContainer}>
                <TouchableOpacity style={styles.fieldItem} onPress={signOutHandler}>
                    <MaterialCommunityIcons name="logout" size={25} color={Colors.white} />
                    <Text style={styles.fieldItemText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>

    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.drawerContainerColor
    },
    fieldItemContainer: {
        width: '100%',
        padding: 20
    },
    fieldItemText: {
        fontSize: 18,
        marginLeft: 20,
        color: Colors.white

    },
    fieldItem: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerContainer: {
        zIndex: 1,
        backgroundColor: Colors.fontColor
    }
})