import React, {useCallback, useContext, useEffect, useState} from 'react';
import Storage from '@react-native-async-storage/async-storage';

import {
    IArticle,
    ICategory,
    IProduct,
    IUser,
    IUseData,
    ITheme,
} from '../constants/types';

import {
    USERS,
    FOLLOWING,
    POPULAR,
    CATEGORIES,
    ARTICLES,
} from '../constants/mocks';
import {light} from '../constants';

export const DataContext = React.createContext({});

export const DataProvider = ({children}: {children: React.ReactNode}) => {
    const [isDark, setIsDark] = useState(false);
    const [theme, setTheme] = useState<ITheme>(light);
    const [user, setUser] = useState<IUser>(USERS[0]);
    const [users, setUsers] = useState<IUser[]>(USERS);
    const [following, setFollowing] = useState<IProduct[]>(FOLLOWING);
    const [popular, setPopular] = useState<IProduct[]>(POPULAR);
    const [categories, setCategories] = useState<ICategory[]>(CATEGORIES);
    const [articles, setArticles] = useState<IArticle[]>(ARTICLES);
    const [article, setArticle] = useState<IArticle>({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // get isDark mode from storage
    const getIsDark = useCallback(async () => {
        // get preferance gtom storage
        const isDarkJSON = await Storage.getItem('isDark');

        if (isDarkJSON !== null) {
            // set isDark / compare if has updated
            setIsDark(JSON.parse(isDarkJSON));
        }
    }, [setIsDark]);

    // handle isDark mode
    const handleIsDark = useCallback(
        (payload: boolean) => {
            // set isDark / compare if has updated
            setIsDark(payload);
            // save preferance to storage
            Storage.setItem('isDark', JSON.stringify(payload));
        },
        [setIsDark],
    );

    // handle users / profiles
    const handleUsers = useCallback(
        (payload: IUser[]) => {
            // set users / compare if has updated
            if (JSON.stringify(payload) !== JSON.stringify(users)) {
                setUsers({...users, ...payload});
            }
        },
        [users, setUsers],
    );

    // handle user
    const handleUser = useCallback(
        (payload: IUser) => {
            // set user / compare if has updated
            if (JSON.stringify(payload) !== JSON.stringify(user)) {
                setUser(payload);
            }
        },
        [user, setUser],
    );

    // handle Article
    const handleArticle = useCallback(
        (payload: IArticle) => {
            // set article / compare if has updated
            if (JSON.stringify(payload) !== JSON.stringify(article)) {
                setArticle(payload);
            }
        },
        [article, setArticle],
    );

    // get isLoggedIn mode from storage
    const getIsLoggedIn = useCallback(async () => {
        // get preferance gtom storage
        const isLoggedInJSON = await Storage.getItem('isLoggedIn');

        if (isLoggedInJSON !== null) {
            // set isDark / compare if has updated
            setIsLoggedIn(JSON.parse(isLoggedInJSON));
        }
    }, [setIsLoggedIn]);

    // handle isLoggedIn mode
    const handleIsLoggedIn = useCallback(
        (payload: boolean) => {
            // set isDark / compare if has updated
            setIsLoggedIn(payload);
            // save preferance to storage
            Storage.setItem('isLoggedIn', JSON.stringify(payload));
        },
        [setIsLoggedIn],
    );

    // get initial data for: isDark & language
    useEffect(() => {
        getIsDark();
    }, [getIsDark]);

    // get initial data for: isLoggedIn
    useEffect(() => {
        getIsLoggedIn();
    }, [getIsLoggedIn]);

    // change theme based on isDark updates
    useEffect(() => {
        setTheme(isDark ? light : light);
    }, [isDark]);

    const contextValue = {
        isDark,
        handleIsDark,
        theme,
        setTheme,
        user,
        users,
        handleUsers,
        handleUser,
        following,
        setFollowing,
        popular,
        setPopular,
        categories,
        setCategories,
        articles,
        setArticles,
        article,
        handleArticle,
        isLoggedIn,
        handleIsLoggedIn,
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext) as IUseData;
