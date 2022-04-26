import React, {useCallback, useEffect, useState} from 'react';
import {Platform, Linking} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/core';

import {Block, Button, Image, Text} from '../components/';
import {useData, useTheme, useTranslation} from '../hooks/';
import {getDatabase, onValue, ref} from 'firebase/database';
import {getAuth} from 'firebase/auth';

const isAndroid = Platform.OS === 'android';

const Profile = () => {
    const {user} = useData();
    const {t} = useTranslation();
    const navigation = useNavigation();
    const {assets, colors, sizes} = useTheme();

    //USESSTATE CHANGES HERE BRUH
    const [numPosts, setNumPosts] = useState(0);
    const [numFollowers, setNumFollowers] = useState(0);
    const [numFollowings, setNumFollowings] = useState(0);

    const IMAGE_SIZE = (sizes.width - (sizes.padding + sizes.sm) * 2) / 3;
    const IMAGE_VERTICAL_SIZE =
        (sizes.width - (sizes.padding + sizes.sm) * 2) / 2;
    const IMAGE_MARGIN = (sizes.width - IMAGE_SIZE * 3 - sizes.padding * 2) / 2;
    const IMAGE_VERTICAL_MARGIN =
        (sizes.width - (IMAGE_VERTICAL_SIZE + sizes.sm) * 2) / 2;

    //FUNCTION 1 get number of posts
    const getNumPost = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const numPostsRef = ref(db, `userPosts/${user.uid}`);
        const numPostsListener = onValue(numPostsRef, (snapshot) => {
            const data = snapshot.val();
            if (data === null) return;
            var dataLen = Object.keys(data).length;
            console.log(dataLen);

            setNumPosts(dataLen);
        });
        return numPostsListener;
    };

    //Function 2 Set Number Of Followers
    const getNumFollowers = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const numFollowersRef = ref(db, `followers/${user.uid}`);
        const numFollowersListener = onValue(numFollowersRef, (snapshot) => {
            const data = snapshot.val();
            if (data === null) return;
            var dataLen = Object.keys(data).length;
            console.log(dataLen);

            setNumFollowers(dataLen);
        });
        return numFollowersListener;
    };

    //Function 3 Set Number of Followings
    const getNumFollowings = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const numFollowingsRef = ref(db, `following/${user.uid}`);
        const numFollowingsListener = onValue(numFollowingsRef, (snapshot) => {
            const data = snapshot.val();
            if (data === null) return;
            var dataLen = Object.keys(data).length;
            console.log(dataLen);

            setNumFollowings(dataLen);
        });
        return numFollowingsListener;
    };

    // //Function 4 Set Number of Followings
    // const getNumFollowings = () => {
    //     const db = getDatabase();
    //     const user = getAuth().currentUser;

    //     if (!user) return;

    //     const numFollowingsRef = ref(db, `following/${user.uid}`);
    //     const numFollowingsListener = onValue(numFollowingsRef, (snapshot) => {
    //         const data = snapshot.val();
    //         if (data === null) return;
    //         var dataLen = Object.keys(data).length;
    //         console.log(dataLen);

    //         setNumFollowings(dataLen);
    //     });
    //     return numFollowingsListener;
    // };

    //UPDATE DIS
    useEffect(() => {
        const numPostsListener = getNumPost();
        const numFollowersListener = getNumFollowers();
        const numFollowingsListener = getNumFollowings();

        return () => {
            numPostsListener?.();
            numFollowersListener?.();
            numFollowingsListener?.();
        };
    }, []);

    return (
        <Block safe marginTop={sizes.md}>
            <Block
                scroll
                paddingHorizontal={sizes.s}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: sizes.padding}}>
                <Block flex={0}>
                    <Image
                        background
                        resizeMode="cover"
                        padding={sizes.sm}
                        paddingBottom={sizes.l}
                        radius={sizes.cardRadius}
                        source={assets.background}>
                        <Button
                            row
                            flex={0}
                            justify="flex-start"
                            onPress={() => navigation.goBack()}>
                            <Image
                                radius={0}
                                width={10}
                                height={18}
                                color={colors.white}
                                source={assets.arrow}
                                transform={[{rotate: '180deg'}]}
                            />
                            <Text p white marginLeft={sizes.s}>
                                {t('profile.title')}
                            </Text>
                        </Button>
                        <Block flex={0} align="center">
                            <Image
                                width={64}
                                height={64}
                                marginBottom={sizes.sm}
                                source={{uri: user?.avatar}}
                            />
                            <Text h5 center white>
                                {user?.name}
                            </Text>
                            {/* <Text p center white>
                                {user?.department}
                            </Text> */}
                            <Block row marginVertical={sizes.m}>
                                <Button
                                    white
                                    outlined
                                    shadow={false}
                                    radius={sizes.m}
                                    onPress={() => {
                                        alert(`Follow ${user?.name}`);
                                    }}>
                                    <Block
                                        justify="center"
                                        radius={sizes.m}
                                        paddingHorizontal={sizes.m}
                                        color="rgba(255,255,255,0.2)">
                                        <Text white bold transform="uppercase">
                                            {t('common.follow')}
                                        </Text>
                                    </Block>
                                </Button>
                            </Block>
                        </Block>
                    </Image>

                    {/* profile: stats */}
                    <Block
                        flex={0}
                        radius={sizes.sm}
                        shadow={!isAndroid} // disabled shadow on Android due to blur overlay + elevation issue
                        marginTop={-sizes.l}
                        marginHorizontal="8%"
                        color="rgba(255,255,255,0.2)">
                        <Block
                            row
                            blur
                            flex={0}
                            intensity={100}
                            radius={sizes.sm}
                            overflow="hidden"
                            tint={colors.blurTint}
                            justify="space-evenly"
                            paddingVertical={sizes.sm}
                            renderToHardwareTextureAndroid>
                            <Block align="center">
                                <Text h5>{numPosts}</Text>
                                <Text>{t('profile.posts')}</Text>
                            </Block>
                            <Block align="center">
                                {/* <Text h5>{(numFollowers || 0) / 1000}k</Text> */}
                                <Text h5>{numFollowers}</Text>
                                <Text>{t('profile.followers')}</Text>
                            </Block>
                            <Block align="center">
                                {/* <Text h5>{(numFollowings || 0) / 1000}k</Text> */}
                                <Text h5>{numFollowings}</Text>
                                <Text>{t('profile.following')}</Text>
                            </Block>
                        </Block>
                    </Block>

                    {/* profile: about me */}
                    <Block paddingHorizontal={sizes.sm}>
                        <Text
                            h5
                            semibold
                            marginBottom={sizes.s}
                            marginTop={sizes.sm}>
                            {t('profile.aboutMe')}
                        </Text>
                        <Text p lineHeight={26}>
                            {user?.about}
                        </Text>
                    </Block>

                    {/* profile: photo album */}
                    <Block paddingHorizontal={sizes.sm} marginTop={sizes.s}>
                        <Block row align="center" justify="space-between">
                            <Text h5 semibold>
                                {t('profile.recentPosts')}
                            </Text>
                            <Button>
                                {/* <Text p primary semibold>
                                    {t('common.viewall')}
                                </Text> */}
                            </Button>
                        </Block>
                        <Block row justify="space-between" wrap="wrap">
                            <Image
                                resizeMode="cover"
                                source={assets?.photo1}
                                style={{
                                    width:
                                        IMAGE_VERTICAL_SIZE + IMAGE_MARGIN / 2,
                                    height:
                                        IMAGE_VERTICAL_SIZE * 2 +
                                        IMAGE_VERTICAL_MARGIN,
                                }}
                            />
                            <Block marginLeft={sizes.m}>
                                <Image
                                    resizeMode="cover"
                                    source={assets?.photo2}
                                    marginBottom={IMAGE_VERTICAL_MARGIN}
                                    style={{
                                        height: IMAGE_VERTICAL_SIZE,
                                        width: IMAGE_VERTICAL_SIZE,
                                    }}
                                />
                                <Image
                                    resizeMode="cover"
                                    source={assets?.photo3}
                                    style={{
                                        height: IMAGE_VERTICAL_SIZE,
                                        width: IMAGE_VERTICAL_SIZE,
                                    }}
                                />
                            </Block>
                        </Block>
                    </Block>
                </Block>
            </Block>
        </Block>
    );
};

export default Profile;
