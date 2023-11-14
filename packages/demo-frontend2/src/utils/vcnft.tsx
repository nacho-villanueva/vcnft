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
    account: JsonRpcSigner | null,
    activeCredentials: JWTWithPayload<W3CCredential>[],
    balance: bigint,
    balanceUpdated: boolean,
    block: number,
    connected: boolean,
    connecting: boolean,
    ethAvailable: boolean,
    ethrDid: EthrDID | null,
    loading: boolean,
    network: Network | null,
    renewing: boolean,
    signingDelegate: { kp: KeyPair, expire: string } | null,
    setup: { state: "SETUP" | "LOADED" | "FAILED", error: any, message: string | null },
    pendingCredentials: any[]
  }

  functions: {
    connectWalletHandler: () => void,
    createPresentation: (creds: JWTWithPayload<W3CCredential>[]) => Promise<string | undefined>,
    createVcnftHolder: () => Holder | null,
    handleImportVCNFT: (e: FormEvent<HTMLInputElement>) => void,
    handleUnloadCredential: (cred: JWTWithPayload<W3CCredential>) => void
    handleVerifyCredential: (cred: JWTWithPayload<W3CCredential>) => Promise<{
      verified: boolean,
      error?: string
    } | undefined>,
    renewDelegate: () => void,
    faucet: () => void,
    handleAddPendingCredential: (issueRequest: any) => void
  }
}

const WalletContext = createContext<WalletContextType | null>(null)

export const WalletContextProvider = ({children}: { children: ReactNode }) => {
  const eth = typeof window !== 'undefined' ? (window as any).ethereum : undefined;
  const provider = new ethers.BrowserProvider(eth);

  const [account, setAccount] = useState<JsonRpcSigner | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [ethrDid, setEthrDid] = useState<EthrDID | null>(null);
  const [signingDelegate, setSigningDelegate] = useState<{ kp: KeyPair, expire: string } | null>(null);
  const [activeCredentials, setActiveCredentials] = useState<JWTWithPayload<W3CCredential>[]>([]);
  const [balance, setBalance] = useState<bigint>(BigInt(0));

  const [pendingCredentials, setPendingCredentials] = useState<any[]>([]);

  const [connecting, setConnecting] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [balanceUpdated, setBalanceUpdated] = useState(false);

  const [setup, setSetup] = useState({
    state: "SETUP" as "SETUP" | "LOADED" | "FAILED",
    error: null as any,
    message: null as string | null
  });

  function hasValidDelegate(addr: string) {
    console.log("hasValidDelegate", addr)

    const delegate = localStorage.getItem(`wallet.${addr}.signingDelegate`)
    console.log("delegate", delegate)
    if (!delegate) return false;

    const parsed = JSON.parse(delegate)
    console.log("parsed", parsed)
    if (!parsed) return false;

    const expire = moment(parsed.expire)
    const now = moment().local()

    console.log("expire", expire, now, expire.isAfter(now))
    return expire.isAfter(now)
  }

  function loadDelegate(addr: string) {
    setSetup(s => ({...s, message: "Loading signing delegate..."}))
    const delegate = localStorage.getItem(`wallet.${addr}.signingDelegate`)
    if (!delegate) return null;

    const parsed = JSON.parse(delegate)
    setSigningDelegate(parsed)

    return parsed
  }

  const renewDelegate = async (did: EthrDID, acc: JsonRpcSigner) => {
    console.log("renewing delegate")
    setRenewing(true)
    try {
      const expire = 30 * 24 * 60 * 60; // 30 days
      const {kp, txHash} = await did.createSigningDelegate(
        DelegateTypes.sigAuth,
        expire
      )

      const delegate = {
        kp: kp,
        expire: moment().local().add(expire, "seconds").toISOString()
      }

      setSigningDelegate(delegate)
      localStorage.setItem(`wallet.${acc.address}.signingDelegate`, JSON.stringify(delegate))
    } catch (e) {
      setSetup(s => ({...s, message: "Failed to renew signing delegate"}))
      console.error("Error renewing delegates", e)
      setRenewing(false)
    }
    setRenewing(false)
  }

  function handleAddPendingCredential(issueRequest: any) {
    const pending = localStorage.getItem("wallet.pendingCredentials")
    if (!pending) {
      localStorage.setItem("wallet.pendingCredentials", JSON.stringify([issueRequest]))
      setPendingCredentials([issueRequest])
    } else {
      const newPending = JSON.stringify(issueRequest)
      const parsed = JSON.parse(pending)
      if (!parsed.some((p: any) => JSON.stringify(p) === newPending)) {
        localStorage.setItem("wallet.pendingCredentials", JSON.stringify(parsed.concat([issueRequest])))
        setPendingCredentials(parsed.concat([issueRequest]))
      }
    }
  }

  async function loadEthrDid(account: JsonRpcSigner, network: Network) {

    let del;
    if (hasValidDelegate(account.address))
      del = await loadDelegate(account.address)

    let ethrDid = new EthrDID({
      identifier: account.address,
      chainNameOrId: network.chainId,
      provider: provider,
      privateKey: del?.kp.privateKey
    })

    if (!hasValidDelegate(account.address)) {
      console.log("Delegates expired")

      let timePassed = 0
      const inter = setInterval(() => {
        setSetup(s => ({
          ...s, message: `Delegates expired.
                Renewing... This may take a minute(${timePassed}s) \n This will only on your first connection`
        }))
        timePassed += 1
      }, 1000)
      await renewDelegate(ethrDid, account)

      clearInterval(inter)
    }

    setEthrDid(ethrDid);
  }

  async function updateBalance(addr: string) {
    try {
      let b = await provider.getBalance(addr);
      setBalance(v => {
        // console.log("balance", addr, b)
        if (v !== b) setBalanceUpdated(false)
        return b
      })
      return b;
    }
    catch (e) {
      console.error("Failed to update balance", e)
      return BigInt(0)
    }
  }

  async function loadPendingCredentials() {
    const pending = localStorage.getItem("wallet.pendingCredentials")
    if (pending && pending !== "[]") {
      const pendingParsed = JSON.parse(pending)

      const resolved = await apiInstance.post(`/holder/credential/resolved`, {
        ids: pendingParsed.map((p: any) => p.id)
      })
        .then(r => r.data as Record<string, string>)
        .catch(r => {
          return {}
        })

      const newPending = pendingParsed.filter((p: any) => !Object.keys(resolved).includes(p.id))
      localStorage.setItem("wallet.pendingCredentials", JSON.stringify(newPending))
      setPendingCredentials(newPending)

      return resolved as Record<string, string>
    }

    return {}
  }

  async function loadCredentials(address: string) {
    let credentials = JSON.parse(localStorage.getItem("wallet.vcnft") ?? "[]") as JWTWithPayload<W3CCredential>[]
    const resolved = await loadPendingCredentials()

    const transfers = await apiInstance.get(`/holder/credential/transfer/${address}`)
      .then(r => r.data as any[])
      .catch(r => ([]))

    const newTransferredCredentials = (transfers
      .map(c => c.credentials)
      .flat() ?? []).map((c: any) => JSON.parse(c));

    const newCredentials = newTransferredCredentials.concat(Object.values(resolved))

    if (newCredentials.length > 0) {
      credentials = newCredentials
        .filter((c: any) => !credentials.some((cred) => cred.jwt === c.jwt))
        .concat(credentials)

      localStorage.setItem("wallet.vcnft", JSON.stringify(credentials))
    }

    if (newTransferredCredentials.length > 0) {
      apiInstance.delete(`/holder/credential/transfer/${address}`)
    }

    if (credentials) setActiveCredentials(credentials)
  }

  async function loadWallet(connect: boolean = false) {
    if (eth) {
      setSetup({state: "SETUP", error: null, message: "Fetching accounts..."})

      provider.listAccounts().then(async (acc) => {
        if (acc.length > 0 || connect) {
          const acc = await provider.getSigner();
          setAccount(acc);

          setSetup({state: "SETUP", error: null, message: "Fetching network..."})

          let network = await provider.getNetwork();

          if (network.chainId !== BigInt(5)) {
            await provider.send("wallet_switchEthereumChain", [{chainId: "0x5"}])
            window.location.reload()
            return;
          }

          setNetwork(network);

          if (!acc || !network) {
            setSetup({state: "FAILED", error: null, message: "Failed to load blockchain wallet"})
            return;
          }

          provider.on("block", (block) => {
            updateBalance(acc.address)
            setCurrentBlock(block)
          })

          eth.on("accountsChanged", async () => {
            await unloadWallet()

            await loadWallet()
            setLoading(true)
            console.log("accounts changed")
          })

          setSetup({state: "SETUP", error: null, message: "Loading balance..."})

          let bal = await updateBalance(acc.address)
          if (bal <= BigInt(10000000000000)) {
            setSetup({state: "SETUP", error: null, message: "Balance too low. Requesting refill from faucet..."})
            await faucet(acc.address, network.chainId.toString())

            if (!hasValidDelegate(acc.address)) {
              let timePassed = 0
              while (bal <= BigInt(10000000000000)) {
                setSetup({
                  state: "SETUP",
                  error: null,
                  message: `Balance too low. Refilling funds... This may take a minute (${timePassed}s)`
                })
                await new Promise(r => setTimeout(r, 1000))
                timePassed += 1
                bal = await updateBalance(acc.address)
              }
            }
          }

          setSetup({state: "SETUP", error: null, message: "Loading Ethr DID..."})

          await loadEthrDid(acc, network)

          setSetup({state: "SETUP", error: null, message: "Loading credentials..."})

          await loadCredentials(acc.address)

          setSetup({state: "SETUP", error: null, message: "Loading block..."})

          setCurrentBlock(await provider.getBlockNumber())
        }
      })
        .catch((e) => {
          toast({
            variant: "destructive",
            title: "Failed to load wallet",
            description: "There was an error while trying to load the wallet. Please try again.",
          })
          setSetup({state: "FAILED", error: e, message: "Failed to load Wallet. Please try again"})
          console.error("Failed to load wallet", e)
        })
        .finally(() => {
          setLoading(false)
          setSetup({state: "LOADED", error: null, message: null})
        })
    }
  }

  async function unloadWallet() {
    await provider.removeAllListeners("block")
    await eth.removeAllListeners("accountsChanged")
    setAccount(null)
    setNetwork(null)
    setEthrDid(null)
  }


  useEffect(() => {
    loadWallet().then(r => console.log("loaded"))

    return () => {
      unloadWallet()
    };
  }, []);

  const connectWalletHandler = async () => {
    if (eth) {
      loadWallet(true).then(r => console.log("loaded"))
    }
  };

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

  const faucet = async (addr: string, chain: string) => {
    setBalanceUpdated(true)
    return await apiInstance
      .post("/vcnft/faucet/" + chain,
        {address: addr})
      .then(r => {
        toast({
          title: "Refilled",
          description: <p>Your wallet has been refilled with 0.001 ETH. <br/><small>Please wait a few seconds for the
            transaction to be confirmed.</small></p>,
        })

        return r.data
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Failed to refill wallet",
          description: "There was an error while trying to refill the wallet. Please try again.",
        })
        setBalanceUpdated(false)
        return undefined
      })
  }

  const handleFaucet = async () => {
    if (!account || !network) return;
    await faucet(account.address, network.chainId.toString())
  }

  const handleRenewDelegate = async () => {
    if (!account || !ethrDid) return;
    await renewDelegate(ethrDid, account)
  }

  const contextValue: WalletContextType = {
    attributes: {
      account: account,
      activeCredentials: activeCredentials,
      balance: balance,
      balanceUpdated: balanceUpdated,
      block: currentBlock,
      connected: !!account && !!network && !!ethrDid,
      connecting: connecting,
      ethAvailable: !!eth,
      ethrDid: ethrDid,
      loading: loading,
      network: network,
      renewing: renewing,
      signingDelegate: signingDelegate,
      setup: setup,
      pendingCredentials: pendingCredentials
    },

    functions: {
      connectWalletHandler: connectWalletHandler,
      renewDelegate: handleRenewDelegate,
      handleImportVCNFT: handleImportVCNFT,
      handleUnloadCredential: handleUnloadCredential,
      handleVerifyCredential: handleVerifyCredential,
      createVcnftHolder: createVcnftHolder,
      createPresentation: createPresentation,
      faucet: handleFaucet,
      handleAddPendingCredential: handleAddPendingCredential
    }
  }


  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
