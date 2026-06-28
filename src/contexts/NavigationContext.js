import React, { createContext, useContext, useState, useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
    const [history, setHistory] = useState(['Home']);
    const [params, setParams] = useState({});

    const currentScreen = history[history.length - 1];
    const currentParams = params[currentScreen] || {};

    const navigate = (screenName, screenParams = {}) => {
        if (screenName === 'Home') {
            if (currentScreen !== 'Home') {
                Alert.alert(
                    'Leave Game?',
                    'Are you sure you want to leave the game? Your current progress will be lost.',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => {} },
                        {
                            text: 'Leave',
                            style: 'destructive',
                            onPress: () => {
                                setHistory(['Home']);
                                setParams({});
                            }
                        }
                    ],
                    { cancelable: true }
                );
            } else {
                setHistory(['Home']);
                setParams({});
            }
        } else {
            setHistory((prev) => [...prev, screenName]);
            setParams((prev) => ({ ...prev, [screenName]: screenParams }));
        }
    };

    const performGoBack = () => {
        setHistory((prev) => {
            if (prev.length <= 1) return prev;
            return prev.slice(0, -1);
        });
    };

    const goBack = (force = false) => {
        if (!force && currentScreen !== 'Home') {
            Alert.alert(
                'Leave Game?',
                'Are you sure you want to leave the game? Your current progress will be lost.',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => {} },
                    { text: 'Leave', style: 'destructive', onPress: () => performGoBack() }
                ],
                { cancelable: true }
            );
        } else {
            performGoBack();
        }
    };

    useEffect(() => {
        const onBackPress = () => {
            if (currentScreen !== 'Home') {
                goBack();
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        return () => subscription.remove();
    }, [currentScreen, goBack]);

    return (
        <NavigationContext.Provider value={{ currentScreen, params: currentParams, navigate, goBack, canGoBack: history.length > 1 }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
