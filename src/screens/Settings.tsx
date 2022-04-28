import React, {useEffect, useState} from 'react';

import {useData, useTheme, useTranslation} from '../hooks/';
import {useNavigation} from '@react-navigation/native';
import {Block, Button, Image, Text, Input} from '../components/';
import {
    AuthCredential,
    EmailAuthProvider,
    getAuth,
    reauthenticateWithCredential,
    updatePassword,
} from 'firebase/auth';
import {getDatabase, onValue, ref, update} from 'firebase/database';
import * as regex from '../constants/regex';

const UserInfoCard = () => {
    const {t} = useTranslation();
    const {assets, gradients, sizes} = useTheme();

    const [aboutMe, setAboutMe] = useState('');
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(false);
    const [buttonGradient, setButtonGradient] = useState<string[]>();

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
            .catch((e) => {
                // console.log(e);
                setError(true);
            });
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
        setError(false);
    }, [aboutMe]);

    useEffect(() => {
        if (error) {
            setButtonGradient(gradients.danger);
        } else if (saved) {
            setButtonGradient(gradients.success);
        } else {
            setButtonGradient(gradients.primary);
        }
    }, [error, saved]);

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
                    gradient={buttonGradient}
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

interface IPasswordValidation {
    currentPassword: boolean;
    newPassword: boolean;
}

const UserSecurityCard = () => {
    const {t} = useTranslation();
    const {assets, gradients, sizes} = useTheme();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [buttonGradient, setButtonGradient] = useState<string[]>();

    const [isValid, setIsValid] = useState<IPasswordValidation>({
        currentPassword: false,
        newPassword: false,
    });

    const reauthenticate = () => {
        var user = getAuth().currentUser;

        if (!user || !user.email) return;

        var cred = EmailAuthProvider.credential(user.email, currentPassword);

        return reauthenticateWithCredential(user, cred);
    };

    const changePassword = () => {
        var user = getAuth().currentUser;

        if (!user) return;

        return updatePassword(user, newPassword);
    };

    const handleSave = () => {
        setIsLoading(true);
        reauthenticate()
            ?.then(() => changePassword())
            .then(() => {
                setSaved(true);
            })
            .catch((e) => {
                // console.log(e);
                setError(true);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        setSaved(false);
        setError(false);

        setIsValid((state) => ({
            ...state,
            currentPassword: currentPassword.length > 0,
            newPassword: regex.password.test(newPassword),
        }));
    }, [currentPassword, newPassword]);

    useEffect(() => {
        if (error) {
            setButtonGradient(gradients.danger);
        } else if (saved) {
            setButtonGradient(gradients.success);
        } else {
            setButtonGradient(gradients.primary);
        }
    }, [error, saved]);

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
                    secureTextEntry
                    label={t('settings.currentPassword')}
                    marginBottom={sizes.sm}
                    placeholder={t('common.passwordPlaceholder')}
                    value={currentPassword}
                    onChangeText={(value) => setCurrentPassword(value)}
                />
                <Input
                    secureTextEntry
                    label={t('settings.newPassword')}
                    marginBottom={sizes.sm}
                    placeholder={t('common.passwordPlaceholder')}
                    value={newPassword}
                    success={Boolean(newPassword && isValid.newPassword)}
                    danger={Boolean(newPassword && !isValid.newPassword)}
                    onChangeText={(value) => setNewPassword(value)}
                />
                <Button
                    flex={1}
                    gradient={buttonGradient}
                    marginBottom={sizes.base}
                    onPress={handleSave}
                    disabled={
                        Object.values(isValid).includes(false) || isLoading
                    }>
                    <Text white bold transform="uppercase">
                        Save
                    </Text>
                </Button>
            </Block>
        </Block>
    );
};

const Settings = () => {
    const {sizes} = useTheme();
    return (
        <Block safe>
            <Block
                scroll
                keyboard
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingVertical: sizes.padding}}>
                <UserInfoCard />

                <UserSecurityCard />
            </Block>
        </Block>
    );
};

export default Settings;
