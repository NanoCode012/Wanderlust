import React, {useCallback, useEffect, useState} from 'react';
import {Linking, Platform} from 'react-native';

import {useData, useTheme, useTranslation} from '../hooks/';
import {useNavigation} from '@react-navigation/core';
import {Block, Button, Image, Input, Text, ArticleCard} from '../components/';
import {IArticle} from '../constants/types';
import * as ImagePicker from 'expo-image-picker';
import {
    getDatabase,
    ref as dbRef,
    push,
    serverTimestamp,
    update,
    Database,
    onValue,
    query,
    orderByKey,
    limitToLast,
    orderByValue,
    limitToFirst,
    orderByChild,
    get,
    DataSnapshot,
} from 'firebase/database';
import {
    getStorage,
    ref as storageRef,
    StorageError,
    uploadBytesResumable,
    getDownloadURL,
} from 'firebase/storage';
import {getAuth, User} from 'firebase/auth';

const isAndroid = Platform.OS === 'android';

const getBlobFromUri = async (uri: string) => {
    // Default method
    // const blob = await new Promise<Blob>((resolve, reject) => {
    //     const xhr = new XMLHttpRequest();
    //     xhr.onload = function () {
    //         resolve(xhr.response);
    //     };
    //     xhr.onerror = function (e) {
    //         reject(new TypeError('Network request failed'));
    //     };
    //     xhr.responseType = 'blob';
    //     xhr.open('GET', uri, true);
    //     xhr.send(null);
    // });

    // https://stackoverflow.com/a/70898768
    try {
        const img = await fetch(uri);
        const blob = await img.blob();
        return blob;
    } catch (e) {
        console.error(e);
        throw Error('An error occurred in getBlobFromUri');
    }
};

const manageFileUpload = async (
    postID: string,
    fileBlob: Blob,
    onStart?: () => void,
    onProgress?: (progress: number) => void,
    onComplete?: (downloadURL: string, postID: string) => void,
    onFail?: (error: StorageError) => void,
) => {
    const imgName = 'background';
    const storage = getStorage();
    const pathToStore = `posts/${postID}/${imgName}.jpeg`;

    const storRef = storageRef(storage, pathToStore);

    // Create file metadata including the content type
    const metadata = {
        contentType: 'image/jpeg',
    };

    // Trigger file upload start event
    onStart && onStart();
    const uploadTask = uploadBytesResumable(storRef, fileBlob, metadata);
    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
        'state_changed',
        (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            // Monitor uploading progress
            onProgress && onProgress(Math.round(progress));
            switch (snapshot.state) {
                case 'paused':
                    // console.log('Upload is paused');
                    break;
                case 'running':
                    // console.log('Upload is running');
                    break;
                default:
                    // console.log(snapshot.state);
                    break;
            }
        },
        (error) => {
            // Something went wrong - dispatch onFail event with error  response
            onFail && onFail(error);
        },
        () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                // dispatch on complete event
                onComplete && onComplete(downloadURL, postID);
            });
        },
    );
};

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
    snapshot.forEach((childSnapshot) => {
        const article = extractArticle(childSnapshot);
        if (!article) return;

        li.push(article);
    });

    return li;
};

const Home = () => {
    const {t} = useTranslation();
    const navigation = useNavigation();
    const [tab, setTab] = useState<number>(0);
    const {handleArticle} = useData();

    const [following, setFollowing] = useState<IArticle[]>([]);
    const [popular, setPopular] = useState<IArticle[]>([]);
    const [articles, setArticles] = useState<IArticle[]>([]);

    const [user, setUser] = useState<User>();
    const [name, setName] = useState('');
    const [followers, setFollowers] = useState<string[]>([]);

    const [openCreate, setOpenCreate] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageURI, setSelectedImageURI] = useState('');
    const [progress, setProgress] = useState(0);
    const [posted, setPosted] = useState(false);

    const [storageError, setStorageError] = useState<StorageError>();

    const {assets, colors, fonts, gradients, sizes} = useTheme();

    let openImagePickerAsync = async () => {
        let permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert('Permission to access camera roll is required!');
            return;
        }

        let pickerResult = await ImagePicker.launchImageLibraryAsync();
        if (pickerResult.cancelled === true) {
            return;
        }

        setSelectedImageURI(pickerResult.uri);
    };

    const onStart = () => {
        setIsUploading(true);
    };

    const onProgress = (progress: number) => {
        setProgress(progress);
    };

    const onComplete = (fileUrl: string, postID: string) => {
        setIsUploading(false);

        if (!user) throw new Error('No user found!');

        const database = getDatabase();

        const updates = {
            ['/posts/' + postID + '/remoteURL']: fileUrl,
        };

        update(dbRef(database), updates)
            .then(() => {})
            .catch((e) => {
                console.log(e);
            });
    };

    const onFail = (error: StorageError) => {
        setStorageError(error);
        switch (error.code) {
            case 'storage/unauthorized':
                console.log(
                    "User doesn't have permission to access the object",
                );
                break;
            case 'storage/canceled':
                console.log('User canceled the upload');
                break;
            case 'storage/unknown':
                console.log(
                    'Unknown error occurred, inspect error.serverResponse',
                );
                break;
        }
        resetField();
    };

    const handleCloudImageUpload = async (postID: string) => {
        if (!selectedImageURI) return;

        const blob = await getBlobFromUri(selectedImageURI);

        await manageFileUpload(
            postID,
            blob,
            onStart,
            onProgress,
            onComplete,
            onFail,
        );
    };

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

    const resetField = () => {
        setTitle('');
        setDescription('');
        setSelectedImageURI('');
    };

    useEffect(() => {
        resetField();
        setPosted(false);
    }, [openCreate]);

    useEffect(() => {
        resetField();
    }, [posted]);

    useEffect(() => {
        const tempUser = getAuth().currentUser;
        if (!tempUser) throw new Error('No user found!');
        setUser(tempUser);
    }, []);

    useEffect(() => {
        if (!user) return;

        const db = getDatabase();
        const nameRef = dbRef(db, 'users/' + user.uid + '/name');

        const nameListener = onValue(nameRef, (snapshot) => {
            const data = snapshot.val();

            if (data) {
                setName(data);
            }
        });

        return () => {
            nameListener();
        };
    }, [user]);

    const getPopularPosts = () => {
        const db = getDatabase();
        const popularRef = query(
            dbRef(db, 'posts'),
            orderByChild('numUpvotes'),
            limitToLast(5),
        );

        const popularListener = onValue(popularRef, (snapshot) => {
            const li: IArticle[] = extractArticles(snapshot);
            // console.log('-------popular');
            // console.log(li.reverse());
            setPopular(li.reverse());
        });

        return popularListener;
    };

    const getFollowers = () => {
        if (!user) return;

        const db = getDatabase();
        const followersRef = query(dbRef(db, `followers/${user.uid}`));

        const followersListener = onValue(
            followersRef,
            (snapshot) => {
                // console.log('-------followers:');
                // console.log(snapshot);
                const data = snapshot.val();
                if (!data) return;

                setFollowers(Object.keys(data));
            },
            (e) => console.log(e),
        );

        return followersListener;
    };

    const getUserFollowingPosts = () => {
        if (!user) return;

        const db = getDatabase();
        const followingRef = query(
            dbRef(db, `userFollowingPosts/${user.uid}`),
            limitToLast(5),
        );

        const followingListener = onValue(
            followingRef,
            (snapshot) => {
                // console.log('-------following:');
                // console.log(snapshot);

                setFollowing([]);
                snapshot.forEach((child) => {
                    if (!child.val()) return;

                    const childRef = dbRef(db, `posts/${child.key}`);
                    onValue(childRef, (childSnapshot) => {
                        const li = extractArticle(childSnapshot, 'vertical');
                        // console.log(li);

                        if (!li) return;
                        setFollowing((prevItem) => [li, ...prevItem]);
                    });
                });
            },
            (e) => console.log(e),
        );

        return followingListener;
    };

    // get userFollowingPosts
    useEffect(() => {
        const followingListener = getUserFollowingPosts();
        const followerListener = getFollowers();
        const popularPostsListener = getPopularPosts();

        return () => {
            followingListener?.();
            followerListener?.();
            popularPostsListener?.();
        };
    }, [user]);

    useEffect(() => {
        setArticles(tab === 0 ? following : popular);
    }, [tab, following, popular]);

    const uploadPost = () => {
        if (!user) return;

        const database = getDatabase();

        const newPostKey = push(dbRef(database, 'posts/')).key;

        if (!newPostKey) throw Error('No post key');

        handleCloudImageUpload(newPostKey);

        const postData: IPostData = {
            title: title,
            description: description,
            createdAt: serverTimestamp(),
            creator: {
                id: user.uid,
                name: name,
            },
            upvotes: [],
            numUpvotes: 0,
            localPath: selectedImageURI
                ? 'posts/' + newPostKey + '/background.jpeg'
                : null,
        };
        const updates = {
            ['/posts/' + newPostKey]: postData,
            ['/userPosts/' + user.uid + '/' + newPostKey]: true,
        };

        // Write to every follower's block
        followers.forEach((follower) => {
            updates[`/userFollowingPosts/${follower}/${newPostKey}`] = true;
        });

        update(dbRef(database), updates)
            .then(() => {
                setPosted(true);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const handlePost = () => {
        if (!title) return;

        uploadPost();
    };

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
                        color={colors.info}
                        onPress={() => setOpenCreate(true)}>
                        <Text p font={fonts.medium}>
                            {t('home.createPost.initialMessage')}
                        </Text>
                    </Button>
                ) : (
                    <Block
                        flex={2}
                        scrollEnabled={false}
                        behavior={!isAndroid ? 'padding' : 'height'}
                        justify="space-evenly"
                        paddingHorizontal={sizes.sm}
                        paddingVertical={sizes.s}
                        color={colors.card}>
                        <Block flex={1}>
                            <Input
                                autoCapitalize="none"
                                marginVertical={sizes.m}
                                label={t('home.createPost.title')}
                                placeholder={t(
                                    'home.createPost.titlePlaceholder',
                                )}
                                value={title}
                                onChangeText={(value) => setTitle(value)}
                                disabled={isUploading || posted}
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
                                disabled={isUploading || posted}
                            />
                        </Block>
                        <Block flex={1}>
                            <Button
                                onPress={openImagePickerAsync}
                                flex={1}
                                gradient={
                                    selectedImageURI
                                        ? gradients.success
                                        : gradients.info
                                }
                                marginBottom={sizes.base}
                                paddingHorizontal={sizes.xl}
                                paddingVertical={sizes.s}
                                disabled={isUploading || posted}>
                                <Text p bold transform="uppercase">
                                    {t('home.createPost.uploadPhoto')}
                                </Text>
                            </Button>
                            <Button
                                onPress={() => {
                                    handlePost();
                                }}
                                flex={1}
                                gradient={
                                    posted
                                        ? gradients.success
                                        : gradients.primary
                                }
                                marginBottom={sizes.base}
                                paddingHorizontal={sizes.xl}
                                paddingVertical={sizes.s}
                                disabled={
                                    title.length == 0 || isUploading || posted
                                }>
                                <Text p bold transform="uppercase">
                                    {t('home.createPost.post')}
                                </Text>
                            </Button>
                            <Button
                                onPress={() => setOpenCreate(false)}
                                flex={1}
                                gradient={gradients.warning}
                                marginBottom={sizes.base}
                                paddingHorizontal={sizes.xl}
                                paddingVertical={sizes.s}>
                                <Text p bold transform="uppercase">
                                    {posted
                                        ? t('common.close')
                                        : t('common.cancel')}
                                </Text>
                            </Button>
                        </Block>
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
                            key={`card-${article?.id}-${Math.random()}`}
                        />
                    ))}
                </Block>
            </Block>
        </Block>
    );
};

export default Home;
