import React from "react";
import {DrizzleContext} from '@drizzle/react-plugin';
import {Drizzle, generateStore} from "@drizzle/store";
import {CookiesProvider} from 'react-cookie';
import drizzleOptions from "./drizzleOptions";
import AppProvider from "./AppProvider";
import ParticlesBg from 'particles-bg'

const drizzleStore = generateStore(drizzleOptions);
const drizzle = new Drizzle(drizzleOptions, drizzleStore);

const App = () => {
    return (
        <CookiesProvider>
            <DrizzleContext.Provider drizzle={drizzle}>
                <AppProvider/>
                <ParticlesBg type='cobweb' bg={true}/>
            </DrizzleContext.Provider>
        </CookiesProvider>
    );
};

export default App;
