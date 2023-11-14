import {Card, CardContent, CardDescription, CardFooter, CardTitle} from "@/components/ui/card";
import ConnectWalletButton from "@/app/wallet/connect-button";
import {cn, getCoinbaseLink, truncateAddress, truncateDid} from "@/utils/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import moment from "moment/moment";
import {Button} from "@/components/ui/button";
import React, {useRef} from "react";
import {useWallet} from "@/utils/vcnft";
import {JWTWithPayload, W3CCredential} from "@vcnft/core";
import CredentialCard from "@/app/wallet/credential";
import {TransferDialog} from "@/app/wallet/requests/transfer";
import {AiFillCaretLeft} from "react-icons/ai";
import {Link} from "react-router-dom";
import {Input} from "@/components/ui/input";
import {toast} from "@/components/ui/use-toast";
import {CopyIcon} from "@radix-ui/react-icons";
import {formatEther} from "ethers";

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

    const didInputRef = useRef<HTMLInputElement>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);

    function handleDidCopy() {
        didInputRef.current?.select();
        didInputRef.current?.setSelectionRange(0, 99999);

        if (attributes.ethrDid?.did)
            navigator.clipboard.writeText(attributes.ethrDid?.did);

        toast({
            title: "Copied DID to clipboard"
        })
    }

    function handleAddressCopy() {
        addressInputRef.current?.select();
        addressInputRef.current?.setSelectionRange(0, 99999);

        if (attributes.account?.address)
            navigator.clipboard.writeText(attributes.account?.address);

        toast({
            title: "Copied address to clipboard"
        })
    }

    const isLoading = attributes.loading || attributes.setup.state === "SETUP";
    const walletLoaded = attributes.setup.state === "LOADED" && !attributes.loading;

    return (
        <>
            <div className={"flex justify-between"}>
                <Button variant={'link'} asChild><Link to={"/"}><AiFillCaretLeft/>Back to demo</Link></Button>
                <div className={"flex gap-2 text-xs p-1"}>
                    {attributes.block && <small>Current Block: {attributes.block}</small>}
                </div>
            </div>
            <div className={"p-5 min-w-screen min-h-screen flex flex-col items-center"}>
                <Card className={"max-w-[500px] w-full p-2"}>
                    {walletLoaded && <>{!attributes.account && <><CardTitle className={"text-center"}>
                        VCNFT Wallet
                    </CardTitle>
                        <CardDescription className={"text-center"}>
                            Manage your decentralized identity in one place.
                        </CardDescription></>}
                        <CardContent className={"p-4 flex justify-center w-full"}>
                            {!attributes.account &&
                                <ConnectWalletButton onConnect={functions.connectWalletHandler}
                                                     connecting={attributes.connecting}/>}
                            {attributes.account && <div>
                            <span className={"flex items-center gap-1"}>
                                <b>Address:</b>
                                <Input className={"max-w-[80%] truncate border-none h-2 px-1"} readOnly
                                       value={attributes.account?.address} ref={didInputRef}/>
                                <Button size={"icon"} className={"w-6 h-6"} variant={"ghost"}
                                        onClick={handleAddressCopy}><CopyIcon/></Button>
                            </span>
                                <span className={"flex items-center gap-1"}>
                                <b>DID:</b>
                                <Input className={"max-w-[80%] truncate border-none h-2 px-1"} readOnly
                                       value={attributes.ethrDid?.did} ref={didInputRef}/>
                                <Button size={"icon"} className={"w-6 h-6"} variant={"ghost"}
                                        onClick={handleDidCopy}><CopyIcon/></Button>
                            </span>
                                <p><b>Network:</b> <span className={"capitalize"}>{attributes.network?.name}</span></p>
                                <div className={"flex flex-wrap items-center gap-3 gap-y-0"}>
                                    <p><b>Signer Expiration:</b>&nbsp;
                                        {attributes.renewing ? <>Renewing... <LoadingSpinner/></>
                                            : (!!attributes.signingDelegate ? moment(attributes.signingDelegate.expire).local().format("DD MMM YYYY")
                                                : <b className={"text-red-500"}>Expired</b>)}</p>
                                    {!attributes.renewing &&
                                        <Button size={"sm"}
                                                disabled={attributes.renewing}
                                                variant={"secondary"}
                                                className={"text-xs p-1 h-5"}
                                                onClick={functions.renewDelegate}>
                                            Renew
                                        </Button>}
                                </div>
                                {attributes.renewing &&
                                    <small className={"text-yellow-400"}>This can take a minute<br/></small>}

                                <span
                                    className={cn("flex items-center gap-1", attributes.balance <= 10_000 && "text-red-500")}>
                                <b>Balance: </b>
                                <span>{formatEther(attributes.balance).slice(0, 8).replace(/\.?0+$/g, "")}</span>
                                    {!attributes.balanceUpdated && attributes.balance <= BigInt(10_000_000_000_000) &&
                                        <Button size={"sm"} variant={"secondary"}
                                                className={"text-xs p-1 h-5 bg-red-500 text-white hover:text-black"}
                                                onClick={functions.faucet}>
                                            Refill
                                        </Button>}
                                    {
                                        attributes.balanceUpdated &&
                                        <span className={"text-yellow-500"}>Pending <LoadingSpinner/></span>
                                    }
                </span>

                                <br/>
                                <Button variant={"outline"} className={"w-full"} onClick={handleImportVCNFTClick}>Import
                                    VCNFT</Button>
                                {/*<Button variant={"outline"} className={"w-full"}>Export Wallet</Button>*/}
                                <TransferDialog/>
                            </div>}
                        </CardContent></>}
                    {attributes.ethAvailable && isLoading &&
                        <div className={"w-full min-h-[150px] flex items-center justify-center"}>
                            <LoadingSpinner size={12} color={"text-yellow-600"}/>
                            <p>
                                <b>{attributes.setup.message}</b>
                            </p>
                        </div>
                    }
                    {!attributes.ethAvailable &&
                        <div className={"w-full flex min-h-[150px] items-center justify-center"}>
                            <p className={"text-red-500"}>Please install an Ethereum wallet. If on mobile, open this
                                using the wallet's browser.
                                <br/>
                                <span className={"text-xs text-gray-500"}>
                  <b>Note:</b> Metamask is not supported on <u>mobile</u>.
                  Consider using&nbsp;
                                    <a href={getCoinbaseLink()} className={"underline text-blue-500"} target={"_blank"}
                                       rel={"noreferrer"}>
                    Coinbase Wallet App
                  </a>.
                </span>
                            </p>
                        </div>
                    }

                    {
                        attributes.setup.state === "FAILED" && (
                            <div className={"w-full flex-col flex items-center justify-center"}>
                                <p className={"text-red-500"}>{attributes.setup.message}</p>
                                <ConnectWalletButton onConnect={functions.connectWalletHandler}
                                                     connecting={attributes.connecting}/>
                            </div>
                        )
                    }

                </Card>

              <PendingCredentialsList credentials={attributes.pendingCredentials}/>
              <CredentialsList
                    credentials={attributes.activeCredentials}
                    onUnloadCredential={functions.handleUnloadCredential}
                    onVerifyCredential={functions.handleVerifyCredential}
                />


                <input type={"file"} hidden ref={inputFileRef} onInput={functions.handleImportVCNFT}/>
            </div>
        </>
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
        <h1 className={"underline font-bold"}>{credentials.length > 0 && "Credentials"}</h1>
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

const PendingCredentialsList = ({credentials}: { credentials: any[] }) => {
    return (credentials.length > 0 ? <div className={"flex flex-col items-start w-full mt-4"}>
      <div className={"flex items-center gap-1"}>
        <h1 className={"underline font-bold"}>{credentials.length > 0 && "Pending Credentials"}</h1>
        <small>(Refresh to update)</small>
      </div>
        <div className={"w-full overflow-y-auto "}>
            <div className={"flex flex-nowrap gap-4 w-fit"}>
                {
                    credentials.map((cred, i) => (
                      <Card className={"max-w-[500px] min-w-min w-full p-2"} key={i}>
                        <CardContent className={"p-4 flex flex-col justify-center w-full"}>
                          <p className={"whitespace-nowrap"}><b>Issuer:</b> {truncateDid(cred.issuer)}</p>
                          <p className={"whitespace-nowrap"}><b>Credential ID:</b> {cred.id.slice(0, 4)} ... {cred.id.slice(-4)}</p>
                          <div className={"mt-2"}><b><u>Claims:</u></b>
                            <ul className={"list"}>
                              {Object.keys(cred.claims).map((key) => (
                                <li key={key}
                                    className={"capitalize"}>{key}: {cred.claims[key]}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                        )
                    )
                }
            </div>
        </div>
    </div> : <></>)
}

export default WalletMain;
