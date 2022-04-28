import React from 'react';

import {useData, useTheme, useTranslation} from '../hooks/';
import {useNavigation} from '@react-navigation/native';
import {Block, Button, Image, Text, ArticleFull} from '../components/';

const ArticleScreen = () => {
    const {t} = useTranslation();
    const navigation = useNavigation();
    const {article} = useData();
    const {assets, colors, fonts, gradients, sizes} = useTheme();
    return (
        <Block>
            <Block
                color={colors.background}
                row
                flex={0}
                style={{paddingHorizontal: sizes.padding}}>
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
                    <Text p black marginLeft={sizes.s}>
                        {t('common.goBack')}
                    </Text>
                </Button>
            </Block>
            <Block
                row
                flex={1}
                color={colors.background}
                style={{paddingBottom: 100}}>
                <ArticleFull {...article} />
            </Block>
        </Block>
    );
};

export default ArticleScreen;
