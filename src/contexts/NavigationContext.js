import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
    const [history, setHistory] = useState(['Home']);
    const [params, setParams] = useState({});

    const navigate = (screenName, screenParams = {}) => {
        setHistory((prev) => [...prev, screenName]);
        setParams((prev) => ({ ...prev, [screenName]: screenParams }));
    };

    const goBack = () => {
        setHistory((prev) => {
            if (prev.length <= 1) return prev;
            return prev.slice(0, -1);
        });
    };

    const currentScreen = history[history.length - 1];
    const currentParams = params[currentScreen] || {};

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
