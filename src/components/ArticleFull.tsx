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
import {getDatabase, ref, increment, update, onValue} from 'firebase/database';
import {getAuth} from 'firebase/auth';

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
    const {colors, gradients, icons, sizes, assets} = useTheme();

    const [upvoted, setUpvoted] = useState(false);
    const [follow, setFollow] = useState(false);
    const [showFollow, setShowFollow] = useState(true);

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

    const getFollows = () => {
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

    useEffect(() => {
        const creatorPostListener = getCreatorPosts();
        const followingListener = getFollows();
        const numUpvotesListener = getNumUpvote();
        const upvotesListener = getUpvotes();

        if (!process.env.IMAGEKIT_ENDPOINT) return;
        if (image) {
            setURI(
                image.replace(
                    process.env.IMAGEKIT_ENDPOINT,
                    process.env.IMAGEKIT_ENDPOINT + 'tr:ar-16-9,h-' + 1000,
                ),
            );
        }

        return () => {
            creatorPostListener?.();
            followingListener?.();
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
                    <Image
                        height={170}
                        resizeMode="cover"
                        source={{uri: uri}}
                    />
                    {/* article category */}
                    {category?.name && (
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
                    )}

                    {/* article title */}
                    {title && (
                        <Text h4 marginBottom={sizes.sm}>
                            {title}
                        </Text>
                    )}

                    {/* article description */}
                    {description && (
                        <Text
                            p
                            marginTop={sizes.s}
                            marginLeft={sizes.xs}
                            marginBottom={sizes.sm}>
                            {description}
                        </Text>
                    )}

                    {/* user details */}
                    <Block
                        row
                        flex={1}
                        marginLeft={sizes.xs}
                        marginBottom={sizes.xs}>
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
                                {timestamp &&
                                    t('common.posted', {
                                        date:
                                            dayjs(timestamp).format(
                                                'DD MMMM',
                                            ) || '-',
                                    })}
                            </Text>
                            {showFollow && (
                                <Button
                                    row
                                    justify="flex-end"
                                    onPress={() => handleFollow()}>
                                    <Image
                                        radius={0}
                                        color={
                                            follow
                                                ? colors.success
                                                : colors.black
                                        }
                                        source={assets.bell}
                                    />
                                    <Text p black marginLeft={sizes.s}>
                                        {t('common.follow')}
                                    </Text>
                                </Button>
                            )}
                            <Button
                                row
                                justify="flex-end"
                                onPress={() => handleUpvote()}>
                                <Image
                                    radius={0}
                                    width={10}
                                    height={18}
                                    color={
                                        upvoted ? colors.success : colors.black
                                    }
                                    source={assets.arrow}
                                    transform={[{rotate: '270deg'}]}
                                />
                                <Text p black marginLeft={sizes.s}>
                                    {numUpvotes + ' ' + t('common.upvote')}
                                </Text>
                            </Button>
                        </Block>
                    </Block>

                    {/* location & rating */}
                    {(Boolean(location) || Boolean(rating)) && (
                        <Block row align="center">
                            <Image
                                source={icons.location}
                                marginRight={sizes.s}
                            />
                            <Text p size={12} semibold>
                                {location?.city}, {location?.country}
                            </Text>
                            <Text p bold marginHorizontal={sizes.s}>
                                •
                            </Text>
                            <Image source={icons.star} marginRight={sizes.s} />
                            <Text p size={12} semibold>
                                {rating}/5
                            </Text>
                        </Block>
                    )}
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
