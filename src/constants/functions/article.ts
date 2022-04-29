import {DataSnapshot} from 'firebase/database';
import {IArticle, IPostData} from '../types';

export const extractArticle = (
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

export const extractArticles = (snapshot: DataSnapshot) => {
    const li: IArticle[] = [];
    snapshot.forEach((childSnapshot) => {
        const article = extractArticle(childSnapshot);
        if (!article) return;

        li.push(article);
    });

    return li;
};

export const getUpdatedArticleInArrayIfExistsOrPush = (
    currentArray: IArticle[],
    newValue: IArticle,
    insertAtEnd: Boolean = true,
) => {
    const eleIndex = currentArray.findIndex((obj) => obj.id === newValue.id);
    if (eleIndex === -1)
        return insertAtEnd
            ? [...currentArray, newValue]
            : [newValue, ...currentArray];

    return currentArray.map((p) =>
        p.id === newValue.id ? {...p, ...newValue} : p,
    );
};
