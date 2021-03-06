import React from 'react';
import dayjs from 'dayjs';
import {TouchableWithoutFeedback} from 'react-native';

import {useEffect} from 'react';

import Text from './Text';
import Block from './Block';
import Image from './Image';
import Button from './Button';
import {useTheme, useTranslation} from '../hooks/';
import {IArticle} from '../constants/types';
import {useState} from 'react';
import {
    getDatabase,
    ref,
    increment,
    update,
    onValue,
    query,
} from 'firebase/database';
import {getAuth} from 'firebase/auth';
import {
    NavigationHelpersContext,
    useNavigation,
} from '@react-navigation/native';

const ArticleFull = ({
    id,
    title,
    description,
    image,
    category,
    rating,
    location,
    timestamp,
    creator,
    onPress,
}: IArticle) => {
    const {t} = useTranslation();
    const navigation = useNavigation();
    const {colors, gradients, icons, sizes, assets} = useTheme();

    const [upvoted, setUpvoted] = useState(false);
    const [follow, setFollow] = useState(false);

    const [followers, setFollowers] = useState<string[]>([]);

    const [showFollow, setShowFollow] = useState(true);
    const [showDelete, setShowDelete] = useState(false);

    const [numUpvotes, setNumUpvotes] = useState(0);
    const [creatorPosts, setCreatorPosts] = useState<string[]>();

    const [uri, setURI] = useState(
        'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    );

    const handleUpvote = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        // if upvoted=false, means user press Upvote to change to true
        const isUpvote = !upvoted;

        const updates = {
            [`posts/${id}/numUpvotes`]: increment(isUpvote ? 1 : -1),
            [`posts/${id}/upvotes/${user.uid}`]: isUpvote ? true : null,
        };

        update(ref(db), updates).catch((e) => {
            console.log(e);
        });
    };

    const handleFollow = () => {
        const db = getDatabase();
        const currentUser = getAuth().currentUser;

        if (!currentUser) return;
        if (!creator) return;
        if (creator.id == currentUser.uid) {
            console.log('You cannot follow yourself');
            return;
        }

        // if upvoted=false, means user press Upvote to change to true
        const applyFollow = !follow;
        const followVal = applyFollow ? true : null;

        const updates = {
            [`following/${currentUser.uid}/${creator.id}`]: followVal,
            [`followers/${creator.id}/${currentUser.uid}`]: followVal,
        };

        // Copy creator's postid to /userFollowingPosts/
        creatorPosts?.forEach((postId) => {
            updates[`/userFollowingPosts/${currentUser.uid}/${postId}`] =
                followVal;
        });

        update(ref(db), updates).catch((e) => {
            console.log(e);
        });
    };

    const handleDelete = () => {
        const user = getAuth().currentUser;
        const database = getDatabase();

        if (!user) return;

        const updates = {
            [`posts/${id}`]: null,
            [`userPosts/${user.uid}/${id}`]: null,
        };

        // Write to every follower's block
        followers.forEach((follower) => {
            updates[`/userFollowingPosts/${follower}/${id}`] = null;
        });

        update(ref(database), updates)
            .then(() => {
                navigation.goBack();
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const getNumUpvote = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const numUpvotesRef = ref(db, `posts/${id}/numUpvotes`);
        const numUpvotesListener = onValue(numUpvotesRef, (snapshot) => {
            // 0 is a valid value
            const data = snapshot.val();
            if (data === null) return;

            setNumUpvotes(data);
        });
        return numUpvotesListener;
    };

    const getUpvotes = () => {
        const db = getDatabase();
        const user = getAuth().currentUser;

        if (!user) return;

        const upvotesRef = ref(db, `posts/${id}/upvotes/${user.uid}`);
        const upvotesListener = onValue(upvotesRef, (snapshot) => {
            const data = snapshot.val();

            setUpvoted(Boolean(data));
        });

        return upvotesListener;
    };

    const getFollowing = () => {
        const db = getDatabase();
        const currentUser = getAuth().currentUser;

        if (!currentUser) return;
        if (!creator) return;
        if (currentUser.uid == creator.id) {
            setShowFollow(false);
            return;
        }

        const followingRef = ref(
            db,
            `following/${currentUser.uid}/${creator.id}`,
        );
        const followingListener = onValue(followingRef, (snapshot) => {
            const data = snapshot.val();

            setFollow(Boolean(data));
        });

        return followingListener;
    };

    const getFollowers = () => {
        const user = getAuth().currentUser;

        if (!user) return;

        const db = getDatabase();
        const followersRef = query(ref(db, `followers/${user.uid}`));

        const followersListener = onValue(
            followersRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data === null) setFollowers([]);
                else setFollowers(Object.keys(data));
            },
            (e) => console.log(e),
        );

        return followersListener;
    };

    const getCreatorPosts = () => {
        if (!creator) return;
        if (creatorPosts) return;

        const db = getDatabase();

        const creatorPostsRef = ref(db, `userPosts/${creator.id}`);
        const creatorPostListener = onValue(
            creatorPostsRef,
            (snapshot) => {
                const data: string[] = [];
                snapshot.forEach((postId) => {
                    if (!postId.key) return;

                    data.push(postId.key);
                });
                setCreatorPosts(data);
            },
            (e) => {
                console.log(e);
            },
        );

        return creatorPostListener;
    };

    const checkDelete = () => {
        const currentUser = getAuth().currentUser;

        if (!currentUser) return;
        if (!creator) return;
        if (currentUser.uid == creator.id) {
            setShowDelete(true);
        }
    };

    useEffect(() => {
        const creatorPostListener = getCreatorPosts();
        const followingListener = getFollowing();
        const followerListener = getFollowers();
        const numUpvotesListener = getNumUpvote();
        const upvotesListener = getUpvotes();

        checkDelete();

        if (!process.env.IMAGEKIT_ENDPOINT) return;
        if (image) {
            setURI(
                image.replace(
                    process.env.IMAGEKIT_ENDPOINT,
                    process.env.IMAGEKIT_ENDPOINT + '/tr:ar-16-9,h-1000/',
                ),
            );
        }

        return () => {
            creatorPostListener?.();
            followingListener?.();
            followerListener?.();
            numUpvotesListener?.();
            upvotesListener?.();
        };
    }, []);

    if (!creator || !creator.avatar) {
        creator = {
            id: creator?.id || -1,
            name: creator?.name || t('common.anonymous'),
            avatar:
                creator?.avatar ||
                'https://images.unsplash.com/photo-1569516449771-41c89ee14ca3?fit=crop&w=80&q=80',
        };
    }

    // render card for Newest & Fashion
    if (category?.id !== 1) {
        return (
            <TouchableWithoutFeedback onPress={onPress}>
                <Block card padding={sizes.sm} marginTop={sizes.sm}>
                    {/* user details */}
                    <Block row flex={0} marginLeft={sizes.xs}>
                        <Image
                            radius={sizes.s}
                            width={sizes.xl}
                            height={sizes.xl}
                            source={{uri: creator?.avatar}}
                            style={{backgroundColor: colors.white}}
                        />

                        <Block marginLeft={sizes.s}>
                            <Text p semibold>
                                {creator?.name}
                            </Text>
                            <Text p gray>
                                {timestamp
                                    ? t('common.posted', {
                                          date:
                                              dayjs(timestamp).format(
                                                  'DD MMMM',
                                              ) || '-',
                                      })
                                    : null}
                            </Text>
                        </Block>
                        {showFollow ? (
                            <Button
                                row
                                justify="flex-end"
                                onPress={() => handleFollow()}>
                                <Image
                                    radius={0}
                                    color={
                                        follow ? colors.success : colors.black
                                    }
                                    source={assets.bell}
                                />
                                <Text p black marginLeft={sizes.s}>
                                    {t('common.follow')}
                                </Text>
                            </Button>
                        ) : null}

                        {showDelete ? (
                            <Button
                                row
                                justify="flex-end"
                                onPress={() => {
                                    handleDelete();
                                }}>
                                <Image
                                    radius={0}
                                    color={colors.danger}
                                    source={assets.trash}
                                />
                                <Text p black marginLeft={sizes.s}>
                                    {t('common.delete')}
                                </Text>
                            </Button>
                        ) : null}
                    </Block>

                    {/* article title */}
                    {title ? (
                        <Text h4 marginBottom={sizes.sm}>
                            {title}
                        </Text>
                    ) : null}

                    <Image
                        height={340}
                        resizeMode="contain"
                        source={{uri: uri}}
                    />
                    {/* article category */}
                    {category?.name ? (
                        <Text
                            h5
                            bold
                            size={13}
                            marginTop={sizes.s}
                            transform="uppercase"
                            marginLeft={sizes.xs}
                            gradient={gradients.primary}>
                            {category?.name}
                        </Text>
                    ) : null}

                    {/* article description */}
                    {description ? (
                        <Text
                            p
                            marginTop={sizes.s}
                            marginLeft={sizes.xs}
                            marginBottom={sizes.sm}>
                            {description}
                        </Text>
                    ) : null}

                    {/* Upvote and follow */}
                    <Block row justify="space-evenly">
                        <Button
                            row
                            // justify="flex-end"
                            onPress={() => handleUpvote()}>
                            <Image
                                radius={0}
                                width={10}
                                height={18}
                                color={upvoted ? colors.success : colors.black}
                                source={assets.arrow}
                                transform={[{rotate: '270deg'}]}
                            />
                            <Text p black marginLeft={sizes.s}>
                                {numUpvotes + ' ' + t('common.upvote')}
                            </Text>
                        </Button>
                    </Block>

                    {/* location & rating */}
                    {Boolean(location) || Boolean(rating) ? (
                        <Block row align="center">
                            <Image
                                source={icons.location}
                                marginRight={sizes.s}
                            />
                            <Text p size={12} semibold>
                                {location?.city}, {location?.country}
                            </Text>
                            <Text p bold marginHorizontal={sizes.s}>
                                ???
                            </Text>
                            <Image source={icons.star} marginRight={sizes.s} />
                            <Text p size={12} semibold>
                                {rating}/5
                            </Text>
                        </Block>
                    ) : null}
                </Block>
            </TouchableWithoutFeedback>
        );
    }

    // render card for Popular
    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <Block card white padding={0} marginTop={sizes.sm}>
                <Image
                    background
                    resizeMode="cover"
                    radius={sizes.cardRadius}
                    source={{uri: image}}>
                    <Block color={colors.overlay} padding={sizes.padding}>
                        <Text h4 white marginBottom={sizes.sm}>
                            {title}
                        </Text>
                        <Text p white>
                            {description}
                        </Text>
                        {/* user details */}
                        <Block row marginTop={sizes.xxl}>
                            <Image
                                radius={sizes.s}
                                width={sizes.xl}
                                height={sizes.xl}
                                source={{uri: creator?.avatar}}
                                style={{backgroundColor: colors.white}}
                            />
                            <Block justify="center" marginLeft={sizes.s}>
                                <Text p white semibold>
                                    {creator?.name}
                                </Text>
                                <Text p white>
                                    {creator?.department}
                                </Text>
                            </Block>
                        </Block>
                    </Block>
                </Image>
            </Block>
        </TouchableWithoutFeedback>
    );
};

export default ArticleFull;
