import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card";
import ConnectWalletButton from "@/app/wallet/connect-button";
import {truncateAddress, truncateDid} from "@/utils/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import moment from "moment/moment";
import {Button} from "@/components/ui/button";
import React, {useRef} from "react";
import {useWallet} from "@/utils/vcnft";
import {JWTWithPayload, W3CCredential} from "@vcnft/core";
import CredentialCard from "@/app/wallet/credential";
import {TransferDialog} from "@/app/wallet/requests/transfer";

const WalletMain = () => {
    const walletContext = useWallet();
    if (walletContext === null) return <></>;
    const {attributes, functions} = walletContext;

    const inputFileRef = useRef<HTMLInputElement>(null);

    const handleImportVCNFTClick = () => {
        if (inputFileRef.current) {
            inputFileRef.current.click();
        }
    }

    return (
        <div className={"p-5 min-w-screen min-h-screen flex flex-col items-center"}>
            <Card className={"max-w-[500px] w-full p-2"}>
                {!attributes.loading && <>{!attributes.account && <><CardTitle className={"text-center"}>
                    VCNFT Wallet
                </CardTitle>
                    <CardDescription className={"text-center"}>
                        Manage your decentralized identity in one place.
                    </CardDescription></>}
                    <CardContent className={"p-4 flex justify-center w-full"}>
                        {!attributes.account &&
                            <ConnectWalletButton onConnect={functions.connectWalletHandler} connecting={attributes.connecting}/>}
                        {attributes.account && <div>
                            <p><b>Address:</b> {truncateAddress(attributes.account.address)}</p>
                            <p><b>DID:</b> {truncateDid(attributes.ethrDid?.did ?? "")}</p>
                            <p><b>Network:</b> <span className={"capitalize"}>{attributes.network?.name}</span></p>
                            <div className={"flex items-center gap-3"}>
                                <p><b>Signer Expiration:</b>&nbsp;
                                    {attributes.renewing ? <>Renewing... <LoadingSpinner/></>
                                        : (!!attributes.signingDelegate ? moment(attributes.signingDelegate.expire).local().format("DD MMM YYYY")
                                            : <b className={"text-red-500"}>Expired</b>)}</p>
                                {!attributes.renewing && <Button size={"sm"} disabled={attributes.renewing} variant={"secondary"}
                                                      className={"text-xs p-1 h-5"} onClick={functions.renewDelegate}>Renew
                                    Delegate</Button>}
                            </div>
                            {attributes.renewing && <small className={"text-yellow-400"}>This can take a minute<br/></small>}
                            <br/>
                            <Button variant={"outline"} className={"w-full"} onClick={handleImportVCNFTClick}>Import
                                VCNFT</Button>
                            <Button variant={"outline"} className={"w-full"}>Export Wallet</Button>
                            <TransferDialog />
                        </div>}
                    </CardContent></>}
                {attributes.ethAvailable && attributes.loading && <div className={"w-full min-h-[150px] flex items-center justify-center"}>
                    <LoadingSpinner size={12} color={"text-yellow-600"}/>
                </div>
                }
                {!attributes.ethAvailable &&
                <div className={"w-full flex min-h-[150px] items-center justify-center"}>
                    <p className={"text-red-500"}>Please install Metamask wallet or open this in the metamask app.</p>
                </div>
                }
            </Card>

            <CredentialsList
                credentials={attributes.activeCredentials}
                onUnloadCredential={functions.handleUnloadCredential}
                onVerifyCredential={functions.handleVerifyCredential}
            />

            <input type={"file"} hidden ref={inputFileRef} onInput={functions.handleImportVCNFT}/>
        </div>
    )
}

type CredentialsListProps = {
    credentials: JWTWithPayload<W3CCredential>[],
    onUnloadCredential?: (cred: JWTWithPayload<W3CCredential>) => void
    onVerifyCredential?: (cred: JWTWithPayload<W3CCredential>) => Promise<{
        verified: boolean,
        error?: string
    } | undefined>
}

const CredentialsList = ({credentials, onUnloadCredential, onVerifyCredential}: CredentialsListProps) => {
    return <div className={"flex flex-col items-start w-full mt-4"}>
        <h1 className={"underline font-bold"}>{credentials.length>0 && "Credentials"}</h1>
        <div className={"w-full overflow-y-auto "}>
            <div className={"flex flex-nowrap gap-4 w-fit"}>
                {
                    credentials.map((cred, i) => (
                            <CredentialCard key={i}
                                            credential={cred}
                                            onVerifyCredential={onVerifyCredential}
                                            onCredentialUnload={onUnloadCredential}/>
                        )
                    )
                }
            </div>
        </div>
    </div>
}

export default WalletMain;
