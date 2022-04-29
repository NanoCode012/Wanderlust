import React, {useCallback, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {useNavigation} from '@react-navigation/core';

import {ArticleCard, Block, Button, Image, Text} from '../components/';
import {useData, useTheme, useTranslation} from '../hooks/';
import {getAuth} from 'firebase/auth';
import {getDatabase, ref, onValue, limitToLast, query} from 'firebase/database';
import {IArticle} from '../constants/types';
import {
    extractArticle,
    getUpdatedArticleInArrayIfExistsOrPush,
} from '../constants/functions/article';

const isAndroid = Platform.OS === 'android';

const Profile = () => {
    const {t} = useTranslation();
    const navigation = useNavigation();
    const {assets, colors, sizes} = useTheme();

    const [numPosts, setNumPosts] = useState(0);
    const [numFollowers, setNumFollowers] = useState(0);
    const [numFollowings, setNumFollowings] = useState(0);
    const [name, setName] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [recent, setRecent] = useState<IArticle[]>([]);
    const {handleArticle} = useData();

    const handleArticlePress = useCallback(
        (article: IArticle) => {
            handleArticle(article);
            navigation.navigate('Article');
        },
        [handleArticle],
    );

    const getNumPost = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const numPostsRef = ref(db, `userPosts/${user.uid}`);
        const numPostsListener = onValue(numPostsRef, (snapshot) => {
            const data = snapshot.val();

            var dataLen = data !== null ? Object.keys(data).length : 0;

            setNumPosts(dataLen);
        });
        return numPostsListener;
    };

    const getNumFollowers = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const numFollowersRef = ref(db, `followers/${user.uid}`);
        const numFollowersListener = onValue(numFollowersRef, (snapshot) => {
            const data = snapshot.val();

            var dataLen = data !== null ? Object.keys(data).length : 0;

            setNumFollowers(dataLen);
        });
        return numFollowersListener;
    };

    const getNumFollowings = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const numFollowingsRef = ref(db, `following/${user.uid}`);
        const numFollowingsListener = onValue(numFollowingsRef, (snapshot) => {
            const data = snapshot.val();

            var dataLen = data !== null ? Object.keys(data).length : 0;

            setNumFollowings(dataLen);
        });
        return numFollowingsListener;
    };

    const getName = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const nameRef = ref(db, `users/${user.uid}/name`);
        const nameListener = onValue(nameRef, (snapshot) => {
            const data = snapshot.val();
            if (data === null) setName('Anonymous');
            else setName(data);
        });
        return nameListener;
    };

    const getAboutMe = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const aboutMeRef = ref(db, `users/${user.uid}/aboutMe`);
        const aboutMe = onValue(aboutMeRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            setAboutMe(data);
        });
        return aboutMe;
    };

    const getRecentPosts = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const listenerRef = query(
            ref(db, `userPosts/${user.uid}`),
            limitToLast(5),
        );

        const recentListener = onValue(listenerRef, (snapshot) => {
            setRecent([]);

            snapshot.forEach((child) => {
                if (!child.val()) return;

                const childRef = ref(db, `posts/${child.key}`);
                onValue(childRef, (childSnapshot) => {
                    const li = extractArticle(childSnapshot);
                    // console.log(li);

                    if (!li) return;
                    setRecent((prevItem) =>
                        getUpdatedArticleInArrayIfExistsOrPush(prevItem, li),
                    );
                });
            });
        });

        return recentListener;
    };

    useEffect(() => {
        const numPostsListener = getNumPost();
        const numFollowersListener = getNumFollowers();
        const numFollowingsListener = getNumFollowings();
        const nameListener = getName();
        const aboutMeListener = getAboutMe();
        const recentListener = getRecentPosts();

        return () => {
            numPostsListener?.();
            numFollowersListener?.();
            numFollowingsListener?.();
            nameListener?.();
            aboutMeListener?.();
            recentListener?.();
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
                                color={colors.black}
                                source={assets.arrow}
                                transform={[{rotate: '180deg'}]}
                            />
                            <Text p marginLeft={sizes.s}>
                                {t('profile.title')}
                            </Text>
                        </Button>
                        <Block flex={0} align="center">
                            <Image
                                width={64}
                                height={64}
                                marginBottom={sizes.sm}
                                source={{
                                    uri: 'https://images.unsplash.com/photo-1569516449771-41c89ee14ca3?fit=crop&w=150&q=80',
                                }}
                            />
                            <Text h4 center bold>
                                {name}
                            </Text>
                            <Block row marginVertical={sizes.m}></Block>
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
                                <Text h5>{numFollowers}</Text>
                                <Text>{t('profile.followers')}</Text>
                            </Block>
                            <Block align="center">
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
                            {aboutMe}
                        </Text>
                    </Block>

                    {/* article list */}
                    <Block
                        scroll
                        paddingHorizontal={sizes.padding}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{paddingBottom: sizes.l}}>
                        <Block
                            row
                            wrap="wrap"
                            justify="space-between"
                            marginTop={sizes.sm}>
                            {recent?.map((article) => (
                                <ArticleCard
                                    article={article}
                                    handlePress={() =>
                                        handleArticlePress(article)
                                    }
                                    key={`card-${article?.id}-${Math.random()}`}
                                />
                            ))}
                        </Block>
                    </Block>
                </Block>
            </Block>
        </Block>
    );
};

export default Profile;
