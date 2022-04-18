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

const ArticleFull = ({
    title,
    description,
    image,
    category,
    rating,
    location,
    timestamp,
    user,
    onPress,
}: IArticle) => {
    const {t} = useTranslation();
    const {colors, gradients, icons, sizes, assets} = useTheme();

    const [upvoted, setUpvoted] = useState(false);

    const handleUpvote = () => {
        //send to db
        setUpvoted(!upvoted);
    };
    if (!user) {
        user = {
            id: -1,
            name: t('common.anonymous'),
            avatar: 'https://images.unsplash.com/photo-1569516449771-41c89ee14ca3?fit=crop&w=80&q=80',
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
                        source={{uri: image}}
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
                            source={{uri: user?.avatar}}
                            style={{backgroundColor: colors.white}}
                        />
                        <Block marginLeft={sizes.s}>
                            <Text p semibold>
                                {user?.name}
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
                                    {'999 ' + t('common.upvote')}
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
                                source={{uri: user?.avatar}}
                                style={{backgroundColor: colors.white}}
                            />
                            <Block justify="center" marginLeft={sizes.s}>
                                <Text p white semibold>
                                    {user?.name}
                                </Text>
                                <Text p white>
                                    {user?.department}
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
