import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, Animated, Dimensions, Linking, StyleSheet} from 'react-native';

import {
    useIsDrawerOpen,
    createDrawerNavigator,
    DrawerContentComponentProps,
    DrawerContentOptions,
    DrawerContentScrollView,
} from '@react-navigation/drawer';

import Screens from './Screens';
import {Block, Text, Switch, Button, Image} from '../components';
import {useData, useTheme, useTranslation} from '../hooks';
import {getAuth} from 'firebase/auth';

const Drawer = createDrawerNavigator();

/* drawer menu screens navigation */
const ScreensStack = () => {
    const {colors} = useTheme();
    const isDrawerOpen = useIsDrawerOpen();
    const animation = useRef(new Animated.Value(0)).current;

    const scale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.88],
    });

    const borderRadius = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 16],
    });

    const animatedStyle = {
        borderRadius: borderRadius,
        transform: [{scale: scale}],
    };

    useEffect(() => {
        Animated.timing(animation, {
            duration: 200,
            useNativeDriver: true,
            toValue: isDrawerOpen ? 1 : 0,
        }).start();
    }, [isDrawerOpen, animation]);

    return (
        <Animated.View
            style={StyleSheet.flatten([
                animatedStyle,
                {
                    flex: 1,
                    overflow: 'hidden',
                    borderColor: colors.card,
                    borderWidth: isDrawerOpen ? 1 : 0,
                },
            ])}>
            <Screens />
        </Animated.View>
    );
};

/* custom drawer menu */
const DrawerContent = (
    props: DrawerContentComponentProps<DrawerContentOptions>,
) => {
    const {navigation} = props;
    const {t, setLocale} = useTranslation();
    const {isDark, handleIsDark} = useData();
    const [active, setActive] = useState('Home');
    const {assets, colors, gradients, sizes} = useTheme();
    const labelColor = colors.text;

    const handleNavigation = useCallback(
        (to) => {
            setActive(to);
            navigation.navigate(to);
        },
        [navigation, setActive],
    );

    const handleWebLink = useCallback((url) => Linking.openURL(url), []);

    // screen list for Drawer menu
    const screens = [
        {name: t('screens.home'), to: 'Home', icon: assets.home},
        // {
        //     name: t('screens.components'),
        //     to: 'Components',
        //     icon: assets.components,
        // },
        // {name: t('screens.articles'), to: 'Articles', icon: assets.document},
        // {name: t('screens.rental'), to: 'Pro', icon: assets.rental},
        {name: t('screens.profile'), to: 'Profile', icon: assets.profile},
        {name: t('screens.settings'), to: 'Settings', icon: assets.settings},
        // {name: t('screens.register'), to: 'Register', icon: assets.register},
        // {name: t('screens.extra'), to: 'Pro', icon: assets.extras},
    ];

    return (
        <DrawerContentScrollView
            {...props}
            scrollEnabled
            removeClippedSubviews
            renderToHardwareTextureAndroid
            contentContainerStyle={{paddingBottom: sizes.padding}}>
            <Block paddingHorizontal={sizes.padding}>
                <Block flex={0} row align="center" marginBottom={sizes.l}>
                    <Image
                        radius={0}
                        width={48}
                        height={48}
                        color={colors.text}
                        source={assets.logo}
                        marginRight={sizes.sm}
                    />
                    <Block>
                        <Text size={12} semibold>
                            {t('app.name')}
                        </Text>
                        <Text size={12} semibold>
                            {t('app.native')}
                        </Text>
                    </Block>
                </Block>

                {screens?.map((screen, index) => {
                    const isActive = active === screen.to;
                    return (
                        <Button
                            row
                            justify="flex-start"
                            marginBottom={sizes.s}
                            key={`menu-screen-${screen.name}-${index}`}
                            onPress={() => handleNavigation(screen.to)}>
                            <Block
                                flex={0}
                                radius={6}
                                align="center"
                                justify="center"
                                width={sizes.md}
                                height={sizes.md}
                                marginRight={sizes.s}
                                gradient={
                                    gradients[isActive ? 'primary' : 'white']
                                }>
                                <Image
                                    radius={0}
                                    width={14}
                                    height={14}
                                    source={screen.icon}
                                    color={colors[isActive ? 'white' : 'black']}
                                />
                            </Block>
                            <Text p semibold={isActive} color={labelColor}>
                                {screen.name}
                            </Text>
                        </Button>
                    );
                })}

                <Block
                    flex={0}
                    height={1}
                    marginRight={sizes.md}
                    marginVertical={sizes.sm}
                    gradient={gradients.menu}
                />

                {/* <Text semibold transform="uppercase" opacity={0.5}>
                    {t('menu.documentation')}
                </Text> */}

                <Button
                    row
                    justify="flex-start"
                    marginTop={sizes.sm}
                    marginBottom={sizes.s}
                    onPress={() => {
                        const auth = getAuth();
                        auth.signOut();
                        navigation.closeDrawer();
                    }}>
                    <Block
                        flex={0}
                        radius={6}
                        align="center"
                        justify="center"
                        width={sizes.md}
                        height={sizes.md}
                        marginRight={sizes.s}
                        gradient={gradients.white}>
                        <Image
                            radius={0}
                            width={14}
                            height={14}
                            color={colors.black}
                            source={assets.close}
                        />
                    </Block>
                    <Text p color={labelColor}>
                        {t('menu.logout')}
                    </Text>
                </Button>

                <Block row justify="flex-start" marginVertical={sizes.s}>
                    <Block row justify="space-between">
                        <Button row onPress={() => setLocale('en')}>
                            <Image
                                source={assets.english}
                                marginHorizontal={sizes.s}
                            />
                            <Text color={labelColor}>{t('language.en')}</Text>
                        </Button>
                        <Button row onPress={() => setLocale('th')}>
                            <Image
                                source={assets.thai}
                                marginHorizontal={sizes.s}
                            />
                            <Text color={labelColor}>{t('language.th')}</Text>
                        </Button>
                    </Block>
                </Block>

                <Block row justify="space-between">
                    <Text color={labelColor}>{t('darkMode')}</Text>
                    <Switch
                        checked={isDark}
                        onPress={(checked) => {
                            handleIsDark(checked);
                        }}
                    />
                </Block>
            </Block>
        </DrawerContentScrollView>
    );
};

/* drawer menu navigation */
export default () => {
    const {gradients, colors} = useTheme();
    const {isLoggedIn} = useData();
    const width = Math.min(250, Dimensions.get('window').width * 0.6); // take min of either 60% of width or 250

    return (
        <Block gradient={gradients.light}>
            <Drawer.Navigator
                drawerType="slide"
                overlayColor="transparent"
                sceneContainerStyle={{backgroundColor: colors.background}}
                drawerContent={(props) => <DrawerContent {...props} />}
                drawerStyle={{
                    flex: 1,
                    width: width,
                    borderRightWidth: 0,
                    backgroundColor: colors.background,
                }}
                screenOptions={{gestureEnabled: isLoggedIn}}>
                <Drawer.Screen name="Screens" component={ScreensStack} />
            </Drawer.Navigator>
        </Block>
    );
};
