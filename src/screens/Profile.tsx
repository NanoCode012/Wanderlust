import React, {useCallback, useEffect, useState} from 'react';
import {Platform, Linking} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/core';

import {ArticleCard, Block, Button, Image, Text} from '../components/';
import {useData, useTheme, useTranslation} from '../hooks/';
import {getAuth} from 'firebase/auth';
import {
    getDatabase,
    ref,
    onValue,
    limitToLast,
    DataSnapshot,
    push,
    serverTimestamp,
    update,
    Database,
    query,
    orderByKey,
    orderByValue,
    limitToFirst,
    orderByChild,
    get,
} from 'firebase/database';
import {IArticle} from '../constants/types';

const isAndroid = Platform.OS === 'android';

interface IPostData {
    title: string;
    description: string;
    createdAt: object;
    creator: {
        id: string;
        name?: string;
    };
    upvotes?: [];
    numUpvotes: number;
    localPath?: string | null;
    remoteURL?: string | null;
}

const Profile = () => {
    const {user} = useData();
    const {t} = useTranslation();
    const navigation = useNavigation();
    const {assets, colors, sizes} = useTheme();

    //USESSTATE CHANGES HERE BRUH
    const [numPosts, setNumPosts] = useState(0);
    const [numFollowers, setNumFollowers] = useState(0);
    const [numFollowings, setNumFollowings] = useState(0);
    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    // const [popular, setPopular] = useState<IArticle[]>([]);
    const [popular, setPopular] = useState(0);
    const [recent, setRecent] = useState<IArticle[]>();
    const [tab, setTab] = useState<number>(0);
    const {handleArticle} = useData();

    const [following, setFollowing] = useState<IArticle[]>([]);
    const [articles, setArticles] = useState<IArticle[]>([]);

    const IMAGE_SIZE = (sizes.width - (sizes.padding + sizes.sm) * 2) / 3;
    const IMAGE_VERTICAL_SIZE =
        (sizes.width - (sizes.padding + sizes.sm) * 2) / 2;
    const IMAGE_MARGIN = (sizes.width - IMAGE_SIZE * 3 - sizes.padding * 2) / 2;
    const IMAGE_VERTICAL_MARGIN =
        (sizes.width - (IMAGE_VERTICAL_SIZE + sizes.sm) * 2) / 2;

    //EXPERIMENT
    const handleArticles = useCallback(
        (tab: number) => {
            setTab(tab);
        },
        [setTab, setArticles],
    );

    const handleArticlePress = useCallback(
        (article: IArticle) => {
            handleArticle(article);
            navigation.navigate('Article');
        },
        [handleArticle],
    );

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

    //Function 4 Set UserName
    const getName = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const nameRef = ref(db, `users/${user.uid}/name`);
        const nameListener = onValue(nameRef, (snapshot) => {
            const data = snapshot.val();
            if (data === null) return;
            // var dataLen = Object.keys(data).length;
            // console.log(dataLen);
            console.log(data);
            setName(data);
        });
        return nameListener;
    };

    //Function 5 Set AboutMe
    const getAbout = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const aboutRef = ref(db, `users/${user.uid}/name`);
        const aboutListener = onValue(aboutRef, (snapshot) => {
            const data = snapshot.val();
            if (data === null) return;
            // var dataLen = Object.keys(data).length;
            // console.log(dataLen);
            console.log(data);
            setAbout(data);
        });
        return aboutListener;
    };

    //Function 6 GetPost
    //userPosts/${userid}
    // limitToLast(5)

    const extractArticle = (
        snapshot: DataSnapshot,
        articleType: string = 'horizontal',
    ): IArticle | undefined => {
        if (!snapshot.key) return;
        if (!process.env.IMAGEKIT_ENDPOINT) return;

        const childVal: IPostData = snapshot.val();
        if (!childVal) return;

        const image = childVal.remoteURL
            ? childVal.remoteURL.replace(
                  'https://firebasestorage.googleapis.com',
                  process.env.IMAGEKIT_ENDPOINT,
              )
            : undefined;

        return {
            ...childVal,
            id: snapshot.key,
            image: image,
            type: articleType,
            timestamp: Number(childVal.createdAt),
        };
    };

    const extractArticles = (snapshot: DataSnapshot) => {
        const li: IArticle[] = [];
        snapshot.forEach((childSnapshot: any) => {
            const article = extractArticle(childSnapshot);
            if (!article) return;

            li.push(article);
        });

        return li;
    };

    const getPopularPosts = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const popularRef = ref(db, `userPosts/${user}`, limitToLast(5));
        // const popularRef = ref(db, `userPosts/${user.uid}`);

        const popularListener = onValue(popularRef, (snapshot) => {
            const li: IArticle[] = extractArticles(snapshot);

            setPopular(li.reverse());
        });

        return popularListener;
    };

    //UPDATE DIS
    useEffect(() => {
        const numPostsListener = getNumPost();
        const numFollowersListener = getNumFollowers();
        const numFollowingsListener = getNumFollowings();
        const nameListener = getName();
        const aboutListener = getAbout();
        const popularListener = getPopularPosts();

        return () => {
            numPostsListener?.();
            numFollowersListener?.();
            numFollowingsListener?.();
            nameListener?.();
            aboutListener?.();
            popularListener?.();
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
                                source={{uri: user?.avatar}}
                            />
                            <Text h4 center bold>
                                {/* {user?.name} */}
                                {name}
                            </Text>
                            {/* <Text p center white>
                                {user?.department}
                            </Text> */}
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
                                <Text h5>
                                    {/* {(user?.stats?.followers || 0) / 1000}k */}
                                    {numFollowers}
                                </Text>
                                <Text>{t('profile.followers')}</Text>
                            </Block>
                            <Block align="center">
                                <Text h5>
                                    {/* {(user?.stats?.following || 0) / 1000}k */}
                                    {numFollowings}
                                </Text>
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
                            {about}
                        </Text>
                    </Block>

                    {/* profile: photo album */}
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
