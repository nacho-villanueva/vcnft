// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';

import {Route, Routes, Link} from 'react-router-dom';
import React from "react";
import Home from "@/app/home";
import Manufacturer from "@/app/manufacturer";
import {Toaster} from "@/components/ui/toaster";
import Wallet from "@/app/wallet";
import {Verifier} from "@/app/verifier";
import {Registry} from "@/app/registry";

export function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/manufacturer/*" element={<Manufacturer/>}/>
                <Route path="/wallet/*" element={<Wallet/>}/>
                <Route path="/verifier/*" element={<Verifier/>}/>
                <Route path="/registry/*" element={<Registry/>}/>
            </Routes>
            <Toaster/>
        </div>
    );
}

export default App;
