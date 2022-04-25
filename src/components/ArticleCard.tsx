import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';

import Block from './Block';
import Image from './Image';
import Text from './Text';
import {IArticleCardProp} from '../constants/types';
import {useTheme, useTranslation} from '../hooks/';

const ArticleCard = ({article, handlePress}: IArticleCardProp) => {
    const {image, title, type} = {...article};
    const {t} = useTranslation();
    const {assets, colors, sizes} = useTheme();
    const [width, setWidth] = useState(0);

    const [uri, setURI] = useState(
        'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    );

    const isHorizontal = type !== 'vertical';

    useEffect(() => {
        const CARD_WIDTH = (sizes.width - sizes.padding * 2 - sizes.sm) / 2;
        const tempWidth = isHorizontal ? CARD_WIDTH * 2 + sizes.sm : CARD_WIDTH;
        setWidth(tempWidth);

        if (!process.env.IMAGEKIT_ENDPOINT) return;
        if (image) {
            setURI(
                image.replace(
                    process.env.IMAGEKIT_ENDPOINT,
                    process.env.IMAGEKIT_ENDPOINT + 'tr:w-' + tempWidth,
                ),
            );
        }
    }, []);

    return (
        <Block
            card
            flex={0}
            row={isHorizontal}
            marginBottom={sizes.sm}
            width={width}>
            <Image
                resizeMode="cover"
                source={{
                    uri: uri,
                }}
                style={{
                    height: isHorizontal ? 114 : 110,
                    width: !isHorizontal ? '100%' : sizes.width / 2.435,
                }}
            />
            <Block
                paddingTop={sizes.s}
                justify="space-between"
                paddingLeft={isHorizontal ? sizes.sm : 0}
                paddingBottom={isHorizontal ? sizes.s : 0}>
                <Text p marginBottom={sizes.s}>
                    {title}
                </Text>
                <TouchableOpacity>
                    <Block row flex={0} align="center">
                        <Text
                            p
                            color={colors.link}
                            semibold
                            size={sizes.linkSize}
                            marginRight={sizes.s}
                            onPress={() => handlePress()}>
                            {t('common.readArticle')}
                        </Text>
                        <Image source={assets.arrow} color={colors.link} />
                    </Block>
                </TouchableOpacity>
            </Block>
        </Block>
    );
};

export default ArticleCard;
