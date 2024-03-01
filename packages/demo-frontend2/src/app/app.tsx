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
import {ErrorBoundary} from "react-error-boundary";

export function App() {
    return (
        <div>
          <ErrorBoundary
            FallbackComponent={Fallback}
            onReset={(details) => {
              // Reset the state of your app so the error doesn't happen again
            }}
          >
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/manufacturer/*" element={<Manufacturer/>}/>
                <Route path="/wallet/*" element={<Wallet/>}/>
                <Route path="/verifier/*" element={<Verifier/>}/>
                <Route path="/registry/*" element={<Registry/>}/>
            </Routes>
            <Toaster/>
          </ErrorBoundary>
        </div>
    );
}

function Fallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div role="alert" className={"flex items-center justify-center w-full p-1 m-0"}>
      <div className={"max-w-[700px] w-full bg-slate-900 rounded p-2"}>
        <p className={"text-white text-sm mb-2 px-1"}>There was an unexpected error. Try reloading or returning to homepage.</p>
        <pre className={"rounded bg-stone-100 p-2 font-sans w-full break-words whitespace-pre-line text-red-900"}>
          {error.message}
          <small>{error.stack}</small></pre>
      </div>
    </div>
  );
}

export default App;
