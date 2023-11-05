import {createContext, FormEvent, ReactNode, useContext, useEffect, useState} from "react";
import {ethers, JsonRpcSigner, Network} from "ethers";
import {DelegateTypes, EthrDID, KeyPair} from "@/utils/ethr/ethr-did";
import {DIDAccount, Holder, JWTWithPayload, W3CCredential} from "@vcnft/core";
import moment from "moment/moment";
import {AccountId} from "caip";
import {apiInstance} from "@/utils/Axios";
import {toast} from "@/components/ui/use-toast";

type WalletContextType = {
    attributes: {
        ethAvailable: boolean,
        connected: boolean,
        account: JsonRpcSigner | null,
        network: Network | null,
        ethrDid: EthrDID | null,
        signingDelegate: { kp: KeyPair, expire: string } | null,
        activeCredentials: JWTWithPayload<W3CCredential>[],
        loading: boolean,
        renewing: boolean,
        connecting: boolean,
    }

    functions: {
        renewDelegate: () => void,
        handleImportVCNFT: (e: FormEvent<HTMLInputElement>) => void,
        createVcnftHolder: () => Holder | null,
        connectWalletHandler: () => void,
        handleUnloadCredential: (cred: JWTWithPayload<W3CCredential>) => void
        handleVerifyCredential: (cred: JWTWithPayload<W3CCredential>) => Promise<{
            verified: boolean,
            error?: string
        } | undefined>,
        createPresentation: (creds: JWTWithPayload<W3CCredential>[]) => Promise<string | undefined>
    }
}

const WalletContext = createContext<WalletContextType | null>(null)

export const WalletContextProvider = ({ children }: {children: ReactNode}) => {
    const eth = typeof window !== 'undefined' ? (window as any).ethereum : undefined;
    const provider = new ethers.BrowserProvider(eth);

    const [account, setAccount] = useState<JsonRpcSigner | null>(null);
    const [network, setNetwork] = useState<Network | null>(null);
    const [ethrDid, setEthrDid] = useState<EthrDID | null>(null);
    const [signingDelegate, setSigningDelegate] = useState<{ kp: KeyPair, expire: string } | null>(null);
    const [activeCredentials, setActiveCredentials] = useState<JWTWithPayload<W3CCredential>[]>([]);

    const [connecting, setConnecting] = useState(false);
    const [renewing, setRenewing] = useState(false);
    const [loading, setLoading] = useState(true);

    function loadDelegate() {
        const delegate = localStorage.getItem("wallet.signingDelegate")
        if (!delegate) return null;

        const parsed = JSON.parse(delegate)
        setSigningDelegate(parsed)

        return parsed
    }

    function loadEthrDid(account: JsonRpcSigner, network: Network) {
        const del = loadDelegate()

        const ethrDid = new EthrDID({
            identifier: account.address,
            chainNameOrId: network.chainId,
            provider: provider,
            privateKey: del?.kp.privateKey
        })

        setEthrDid(ethrDid);
    }

    async function loadCredentials(address: string) {
        let credentials = JSON.parse(localStorage.getItem("wallet.vcnft") ?? "[]") as JWTWithPayload<W3CCredential>[]

        const transfers = await apiInstance.get(`/holder/credential/transfer/${address}`)
            .then(r => r.data as any[])
            .catch(r => {return []})

        const newCredentials = transfers.map(c => c.credentials).flat()
        if (newCredentials.length > 0) {

            console.log("newcred", newCredentials)
            credentials = newCredentials.map(c => JSON.parse(c))
                .filter((c: any) => !credentials.some((cred) => cred.jwt === c.jwt))
                .concat(credentials)
            console.log("cred", credentials)

            localStorage.setItem("wallet.vcnft", JSON.stringify(credentials))

            apiInstance.delete(`/holder/credential/transfer/${address}`)
        }

        if (credentials) setActiveCredentials(credentials)
    }

    useEffect(() => {
        async function loadWallet() {
            if (eth) {
                provider.listAccounts().then(async (acc) => {
                    if (acc.length > 0) {
                        const acc = await provider.getSigner();
                        setAccount(acc);

                        const network = await provider.getNetwork();
                        setNetwork(network);

                        if(!acc || !network) throw new Error("Failed to load wallet")
                        loadEthrDid(acc, network)
                        await loadCredentials(acc.address)
                    }
                })
                    .catch((e) => {
                      toast({
                            variant: "destructive",
                            title: "Failed to load wallet",
                            description: "There was an error while trying to load the wallet. Please try again.",
                      })
                    })
                    .finally(() => setLoading(false))

            }
        }

        loadWallet().then(r => console.log("loaded"))
    }, []);

    const connectWalletHandler = async () => {
        if (eth) {
            setConnecting(true);
            let signer: JsonRpcSigner;
            try {
                signer = await provider.getSigner();
            } catch (e) {
                setConnecting(false);
                return;
            }

            setAccount(signer)
            const network = await provider.getNetwork();
            setNetwork(network);

            loadEthrDid(signer, network)
            setConnecting(false)
        }
    };

    const renewDelegate = async () => {
        if (ethrDid) {
            setRenewing(true)
            try {
                const expire = 30 * 24 * 60 * 60; // 30 days
                const {kp, txHash} = await ethrDid.createSigningDelegate(
                    DelegateTypes.sigAuth,
                    expire
                )

                const delegate = {
                    kp: kp,
                    expire: moment().local().add(expire, "seconds").toISOString()
                }

                setSigningDelegate(delegate)
                localStorage.setItem("wallet.signingDelegate", JSON.stringify(delegate))

                loadEthrDid(account as JsonRpcSigner, network as Network)
            } catch (e) {
                setRenewing(false)
            }
            setRenewing(false)
        }
    }

    const handleImportVCNFT = (e: FormEvent<HTMLInputElement>) => {
        e.currentTarget?.files?.[0].text().then((text) => {
            const cred = JSON.parse(text)
            let credentials = JSON.parse(localStorage.getItem("wallet.vcnft") ?? "[]")
            credentials = credentials.filter((c: any) => c.jwt !== cred.jwt)
            credentials.push(cred)
            localStorage.setItem("wallet.vcnft", JSON.stringify(credentials))
            setActiveCredentials(credentials)
        });
    }

    const createVcnftHolder = () => {
        if (!account || !network || !ethrDid) return null;

        async function signer(message: string) {
            const sign = await account?.signMessage(message)
            if (!sign) throw new Error("Failed to sign message");
            return sign
        }

        return new Holder({
            accountId: new AccountId({
                address: account.address,
                chainId: {namespace: "eip155", reference: network.chainId.toString()}
            }),
            signer: signer
        }, ethrDid as DIDAccount)
    }

    const createPresentation = async (creds: JWTWithPayload<W3CCredential>[]) => {
        const holder = createVcnftHolder()
        if (!holder) return;
        const pay = await holder.generatePresentationPayload(creds)
        return await holder.signPresentation(pay)
    }

    const handleVerifyCredential = async (cred: JWTWithPayload<W3CCredential>) => {
        const presentation = await createPresentation([cred])
        if (!presentation) return;

        return apiInstance.post("/holder/credential/verify",
            {presentation: presentation}
        ).then(r => {
            const res = r.data as {
                verified: boolean,
                error?: { verified: boolean, message: string }[]
            }

            if (!res.verified)
                toast({
                    title: "Verification Failed",
                    description: "Reason: " + res.error?.map(e => e.message).join(", "),
                    variant: "destructive"
                })


            return r.data
        })
            .catch(r => {
                return undefined
            })
    }

    const handleUnloadCredential = (cred: any) => {
        let credentials = JSON.parse(localStorage.getItem("wallet.vcnft") ?? "[]")
        credentials = credentials.filter((c: any) => c.jwt !== cred.jwt)
        localStorage.setItem("wallet.vcnft", JSON.stringify(credentials))
        setActiveCredentials(credentials)
    }

    const contextValue: WalletContextType = {
        attributes: {
            ethAvailable: !!eth,
            connected: !!account && !!network && !!ethrDid,
            account: account,
            network: network,
            ethrDid: ethrDid,
            signingDelegate: signingDelegate,
            activeCredentials: activeCredentials,
            loading: loading,
            renewing: renewing,
            connecting: connecting,
        },

        functions: {
            connectWalletHandler: connectWalletHandler,
            renewDelegate: renewDelegate,
            handleImportVCNFT: handleImportVCNFT,
            handleUnloadCredential: handleUnloadCredential,
            handleVerifyCredential: handleVerifyCredential,
            createVcnftHolder: createVcnftHolder,
            createPresentation: createPresentation,
        }
    }


    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => useContext(WalletContext)
