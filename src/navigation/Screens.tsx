import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
    Article,
    Articles,
    Components,
    Home,
    Profile,
    Register,
    Login,
    Pro,
} from '../screens';
import {useScreenOptions, useTranslation, useData} from '../hooks';

const Stack = createStackNavigator();

export default () => {
    const {isLoggedIn} = useData();
    const {t} = useTranslation();
    const screenOptions = useScreenOptions();

    return (
        <Stack.Navigator screenOptions={screenOptions.stack}>
            {isLoggedIn ? (
                <>
                    <Stack.Screen
                        name="Home"
                        component={Home}
                        options={{title: t('navigation.home')}}
                    />
                    <Stack.Screen
                        name="Components"
                        component={Components}
                        options={screenOptions.components}
                    />
                    <Stack.Screen
                        name="Articles"
                        component={Articles}
                        options={{title: t('navigation.articles')}}
                    />
                    <Stack.Screen
                        name="Article"
                        component={Article}
                        // options={{title: t('navigation.article')}}
                    />
                    <Stack.Screen
                        name="Pro"
                        component={Pro}
                        options={screenOptions.pro}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={Profile}
                        options={{headerShown: false}}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen
                        name="Login"
                        component={Login}
                        options={{headerShown: false}}
                    />
                    <Stack.Screen
                        name="Register"
                        component={Register}
                        options={{headerShown: false}}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};
