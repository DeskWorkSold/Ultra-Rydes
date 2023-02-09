import React from 'react';
import {
    ScrollView,
    Text,
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    Modal,
    ToastAndroid,
    Alert,
    PermissionsAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Foundation from 'react-native-vector-icons/Foundation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../Constants/Colors';
// import {
//     widthPercentageToDP as wp,
//     heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';

export default function ModalImg({
    modalVisible,
    openGallery,
    openCamera,
    removeImage,
    closeModal,
}) {
    //   const [modalVisible, setModalVisible] = useState(false);
    //   const showModal = () => setModalVisible(true);
    //   const hideModal = () => setModalVisible(false);
    return (
        <Modal transparent={true} visible={modalVisible} animationType="slide">
            <View style={styles.backContainer}>
                <View style={styles.frontContainer}>
                    <TouchableOpacity style={styles.innerContainer} onPress={openCamera}>
                        <Text style={styles.textStyle}>Take a Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.midContainer} onPress={openGallery} >
                        <Text style={styles.textStyle}>Upload a Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeContainer} onPress={removeImage} >
                        <Text style={styles.textStyle}>Remove Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.innerContainer} onPress={closeModal}>
                        <Text style={styles.textStyle}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
const styles = StyleSheet.create({
    backContainer: {
        backgroundColor: '#000000aa',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    frontContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerContainer: {
        padding: 10,
        paddingHorizontal: 30,
    },
    midContainer: {
        padding: 10,
        paddingHorizontal: 30,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: Colors.gray
    },
    removeContainer: {
        padding: 10,
        paddingHorizontal: 30,
        borderBottomWidth: 1,
        borderColor: Colors.gray
    },
    textStyle: {
        fontSize: 15,
        color: Colors.fontColor
    }
})