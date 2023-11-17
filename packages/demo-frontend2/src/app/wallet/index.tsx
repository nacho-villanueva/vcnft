import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ethers, JsonRpcSigner, Network} from "ethers";
import React, {createContext, FormEvent, useEffect, useRef, useState} from "react";
import {truncateAddress, truncateDid} from "@/utils/utils";
import {DelegateTypes, EthrDID, KeyPair} from "@/utils/ethr/ethr-did";
import {DIDAccount, Holder, JWTWithPayload, W3CCredential} from "@vcnft/core";
import moment from "moment";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {AccountId} from "caip";
import CredentialCard from "@/app/wallet/credential";
import ConnectWalletButton from "@/app/wallet/connect-button";
import {apiInstance} from "@/utils/Axios";
import {toast} from "@/components/ui/use-toast";
import {Route, Routes} from "react-router-dom";
import WalletVerify from "@/app/wallet/requests/verify";
import {WalletContextProvider} from "@/utils/vcnft";
import WalletMain from "@/app/wallet/wallet";
import {TransferAction} from "@/app/wallet/requests/transfer-action";
import {ClaimVCNFTRequest} from "@/app/wallet/requests/claim";

type WalletContextType = {
    account: JsonRpcSigner | null,
    network: Network | null,
    ethrDid: EthrDID | null,
    signingDelegate: { kp: KeyPair, expire: string } | null,
    activeCredentials: JWTWithPayload<W3CCredential>[],
}

export const WalletContext = createContext<WalletContextType>({
    account: null,
    network: null,
    ethrDid: null,
    signingDelegate: null,
    activeCredentials: [],
})


function Wallet() {
    return (
        <WalletContextProvider>
            <WalletMain />

            <Routes>
                <Route path={"verify/:id"} element={<WalletVerify />}/>
                <Route path={"transfer/:address"} element={<TransferAction />}/>
                <Route path={"claim/:id"} element={<ClaimVCNFTRequest />}/>
            </Routes>
        </ WalletContextProvider>
    );
}

export default Wallet

