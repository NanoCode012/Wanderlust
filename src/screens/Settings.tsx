import React, {useEffect, useState} from 'react';

import {useData, useTheme, useTranslation} from '../hooks/';
import {useNavigation} from '@react-navigation/native';
import {Block, Button, Image, Text, ArticleFull, Input} from '../components/';
import {TouchableOpacity} from 'react-native';
import {getAuth} from 'firebase/auth';
import {getDatabase, onValue, ref, update} from 'firebase/database';

const UserInfoCard = () => {
    const {t} = useTranslation();
    const {assets, gradients, sizes} = useTheme();

    const [aboutMe, setAboutMe] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const updates = {
            [`users/${user.uid}/aboutMe`]: aboutMe ? aboutMe : null,
        };

        update(ref(db), updates)
            .then(() => {
                setSaved(true);
            })
            .catch((e) => console.log(e));
    };

    const getUserAboutMe = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const aboutMeRef = ref(db, `users/${user.uid}/aboutMe`);
        const aboutMeListener = onValue(aboutMeRef, (snapshot) => {
            const data = snapshot.val();

            if (!data) return;

            setAboutMe(data);
        });
        return aboutMeListener;
    };

    useEffect(() => {
        const aboutMeListener = getUserAboutMe();

        return () => {
            aboutMeListener?.();
        };
    }, []);

    useEffect(() => {
        setSaved(false);
    }, [aboutMe]);

    return (
        <Block card>
            <Block row>
                <Image
                    resizeMode="contain"
                    source={assets?.card1}
                    height={74}
                    width={74}
                />
                <Block justify="center">
                    <Text h2>{t('settings.userInfo')}</Text>
                </Block>
            </Block>
            <Block padding={sizes.s} justify="space-between">
                <Input
                    label={t('profile.aboutMe')}
                    marginBottom={sizes.sm}
                    placeholder={t('settings.aboutMePlaceholder')}
                    value={aboutMe}
                    onChangeText={(value) => setAboutMe(value)}
                />
                <Button
                    flex={1}
                    gradient={saved ? gradients.success : gradients.primary}
                    marginBottom={sizes.base}
                    onPress={handleSave}>
                    <Text white bold transform="uppercase">
                        Save
                    </Text>
                </Button>
            </Block>
        </Block>
    );
};

const UserSecurityCard = () => {
    const {t} = useTranslation();
    const {article} = useData();
    const {assets, colors, fonts, gradients, sizes} = useTheme();

    const [password, setPassword] = useState('');

    const handleSave = () => {
        console.log('save');
    };
    return (
        <Block card marginTop={sizes.m}>
            <Block row>
                <Image
                    resizeMode="contain"
                    source={assets?.card2}
                    height={74}
                    width={74}
                />
                <Block justify="center">
                    <Text h2>{t('settings.userSecurity')}</Text>
                </Block>
            </Block>
            <Block padding={sizes.s} justify="space-between">
                <Input
                    label={t('common.password')}
                    marginBottom={sizes.sm}
                    placeholder={t('common.passwordPlaceholder')}
                    value={password}
                    onChangeText={(value) => setPassword(value)}
                />
                <Button
                    flex={1}
                    gradient={gradients.primary}
                    marginBottom={sizes.base}
                    onPress={handleSave}>
                    <Text white bold transform="uppercase">
                        Save
                    </Text>
                </Button>
            </Block>
        </Block>
    );
};

const Settings = () => {
    const {t} = useTranslation();
    const navigation = useNavigation();
    const {article} = useData();
    const {assets, colors, fonts, gradients, sizes} = useTheme();
    return (
        <Block safe>
            <Block
                scroll
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingVertical: sizes.padding}}>
                <UserInfoCard />

                <UserSecurityCard />
            </Block>
        </Block>
    );
};

export default Settings;
