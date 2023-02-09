import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView, StyleSheet, Dimensions, StatusBar, FlatList, View, ImageBackground, Image, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import Colors from '../Constants/Colors'






const slides = [
    {
        id: '1',
        image: require('../Assets/Images/Destination.png'),
        title: 'Choose Your Destination',
        subtitle: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. "
    },
    {
        id: '2',
        image: require('../Assets/Images/YourRide.png'),
        title: 'Check Your Ride',
        subtitle: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. "
    },
    {
        id: '3',
        image: require('../Assets/Images/EnjoyYourRide.png'),
        title: 'Enjoy Your Ride',
        subtitle: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. "
    }
]




export default function OnBoardingScreen({ navigation }) {
    const { width, height } = Dimensions.get('window');

    const ref = useRef(null);
    const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);

    const updateCurrentSlideIndex = e => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        console.log(contentOffsetX);
        const currentIndex = Math.round(contentOffsetX / width);
        setCurrentSlideIndex(currentIndex);

    }

    const goToNext = () => {
        const nextSlideIndex = currentSlideIndex + 1;
        const offset = nextSlideIndex * width;
        ref?.current?.scrollToOffset({ offset })
        setCurrentSlideIndex(nextSlideIndex)

    }


    const Slide = ({ item }) => {
        // console.log(item)
        return (
            <View style={styles.centerItems}>
                <Image
                    source={item.image}
                    style={{ height: '50%', width, }}
                    resizeMode='contain'
                />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>
            </View>
        )
    }

    const Footer = () => {
        return (
            <View style={styles.footerContainer}>
                {currentSlideIndex == slides.length - 1 ? <View>
                    <TouchableOpacity onPress={() => navigation.replace('GetStartedScreen')} >
                        <Text style={styles.nextStyles}>Get Started</Text>
                    </TouchableOpacity>
                </View> : <View>
                    <View>
                        <TouchableOpacity onPress={goToNext}>
                            <Text style={styles.nextStyles}>Next</Text>
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}>
                        {/* Render indicator */}
                        {slides.map((_, index) => (
                            <View key={index} style={[
                                styles.indicator,
                                currentSlideIndex == index && {
                                    backgroundColor: Colors.white,
                                    width: 25,
                                },
                            ]} />
                        ))}
                    </View>
                </View>}
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.rootContainer}>
            < ImageBackground
                source={require('../Assets/Images/CircleHighLightColor.png')}
                resizeMode="cover"
                style={styles.UpperContainer}
            >
                <View style={styles.innerTopContainer}>
                    <FlatList
                        ref={ref}
                        onMomentumScrollEnd={updateCurrentSlideIndex}
                        data={slides}
                        contentContainerStyle={{ height: height }}
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        pagingEnabled
                        renderItem={({ item }) => <Slide item={item} />}
                    /></View>
                <View style={styles.innerBottomContainer}>
                    <Footer /></View>
            </ImageBackground>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center'
    },
    centerItems: {
        flex: 1,
        alignItems: 'center',

    },
    dots: {
        width: 15,
        height: 8,
        borderRadius: 10,
        backgroundColor: 'grey'

    },
    footerContainer: {
        flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center'
    },
    indicator: {
        height: 2.5,
        width: 10,
        backgroundColor: 'grey',
        marginHorizontal: 3,
        borderRadius: 2
    },
    innerTopContainer: {
        // flex: 3
        height: '80%',
        alignItems: 'center'
    },
    innerBottomContainer: {
        height: '20%',
        alignItems: "center",
    },
    nextStyles: {
        fontSize: 20,
        color: Colors.white,
        marginBottom: 5,
        fontWeight: 'bold'
    },
    rootContainer: {
        flex: 1,
        alignItems: 'center',
    },
    subtitle: {
        color: Colors.black,
        fontSize: 10,
        maxWidth: '60%',
        textAlign: 'center',
        fontFamily: 'Poppins-Medium',
        lineHeight: 20,
    },
    title: {
        color: Colors.primary,
        fontSize: 25,
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
    },
    textContainer: {
        alignItems: 'center'
    },
    UpperContainer: {
        flex: 1,
        alignSelf: 'center'
    }

})
