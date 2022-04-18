import React, {useCallback, useState} from 'react';
import {Linking, Platform} from 'react-native';

import {useData, useTheme, useTranslation} from '../hooks/';
import {useNavigation} from '@react-navigation/core';
import {Block, Button, Image, Input, Text, ArticleCard} from '../components/';
import {IArticle} from '../constants/types';

const isAndroid = Platform.OS === 'android';

const Home = () => {
    const {t} = useTranslation();
    const navigation = useNavigation();
    const [tab, setTab] = useState<number>(0);
    const {following, popular, handleArticle} = useData();
    const [articles, setArticles] = useState(following);

    const [openCreate, setOpenCreate] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const {assets, colors, fonts, gradients, sizes} = useTheme();

    const handleArticles = useCallback(
        (tab: number) => {
            setTab(tab);
            setArticles(tab === 0 ? following : popular);
        },
        [following, popular, setTab, setArticles],
    );

    const handleArticlePress = useCallback(
        (article: IArticle) => {
            handleArticle(article);
            navigation.navigate('Article');
        },
        [handleArticle],
    );

    const handleCreatePost = useCallback((opt: boolean) => {
        setOpenCreate(opt);
        setTitle('');
        setDescription('');
    }, []);

    return (
        <Block>
            {/* search input */}
            <Block
                color={colors.card}
                flex={openCreate ? 2 : 0}
                padding={sizes.padding}>
                {/* Search bar */}
                {/* <Input search placeholder={t('common.search')} /> */}

                {/* Expanable create post */}
                {!openCreate ? (
                    <Button
                        color={colors.background}
                        shadow={false}
                        onPress={() => handleCreatePost(true)}>
                        <Text p font={fonts?.[tab === 0 ? 'medium' : 'normal']}>
                            {t('home.createPost.initialMessage')}
                        </Text>
                    </Button>
                ) : (
                    <Block
                        flex={2}
                        scrollEnabled={false}
                        behavior={!isAndroid ? 'padding' : 'height'}
                        paddingHorizontal={sizes.sm}
                        paddingVertical={sizes.s}
                        color={colors.card}>
                        <Input
                            autoCapitalize="none"
                            marginVertical={sizes.m}
                            label={t('home.createPost.title')}
                            placeholder={t('home.createPost.titlePlaceholder')}
                            value={title}
                            onChangeText={(value) => setTitle(value)}
                        />
                        <Input
                            autoCapitalize="none"
                            marginVertical={sizes.m}
                            label={t('home.createPost.description')}
                            placeholder={t(
                                'home.createPost.descriptionPlaceholder',
                            )}
                            value={description}
                            onChangeText={(value) => setDescription(value)}
                        />
                        <Button
                            onPress={() => handleCreatePost(false)}
                            shadow={false}>
                            <Text
                                p
                                font={fonts?.[tab === 0 ? 'medium' : 'normal']}>
                                {t('common.cancel')}
                            </Text>
                        </Button>
                        {/* <Input search placeholder={t('common.search')} /> */}
                    </Block>
                )}
            </Block>

            {/* toggle articles list */}
            <Block
                row
                flex={0}
                align="center"
                justify="center"
                color={colors.card}
                paddingBottom={sizes.sm}>
                <Button onPress={() => handleArticles(0)}>
                    <Block row align="center">
                        <Block
                            flex={0}
                            radius={6}
                            align="center"
                            justify="center"
                            marginRight={sizes.s}
                            width={sizes.socialIconSize}
                            height={sizes.socialIconSize}
                            gradient={
                                gradients?.[tab === 0 ? 'primary' : 'secondary']
                            }>
                            <Image
                                source={assets.extras}
                                color={colors.white}
                                radius={0}
                            />
                        </Block>
                        <Text p font={fonts?.[tab === 0 ? 'medium' : 'normal']}>
                            {t('home.following')}
                        </Text>
                    </Block>
                </Button>
                <Block
                    gray
                    flex={0}
                    width={1}
                    marginHorizontal={sizes.sm}
                    height={sizes.socialIconSize}
                />
                <Button onPress={() => handleArticles(1)}>
                    <Block row align="center">
                        <Block
                            flex={0}
                            radius={6}
                            align="center"
                            justify="center"
                            marginRight={sizes.s}
                            width={sizes.socialIconSize}
                            height={sizes.socialIconSize}
                            gradient={
                                gradients?.[tab === 1 ? 'primary' : 'secondary']
                            }>
                            <Image
                                radius={0}
                                color={colors.white}
                                source={assets.documentation}
                            />
                        </Block>
                        <Text p font={fonts?.[tab === 1 ? 'medium' : 'normal']}>
                            {t('home.popular')}
                        </Text>
                    </Block>
                </Button>
            </Block>

            {/* articles list */}
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
                    {articles?.map((article) => (
                        <ArticleCard
                            article={article}
                            handlePress={() => handleArticlePress(article)}
                            key={`card-${article?.id}`}
                        />
                    ))}
                </Block>
            </Block>
        </Block>
    );
};

export default Home;
