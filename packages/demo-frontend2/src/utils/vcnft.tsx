import {createContext, FormEvent, ReactNode, useContext, useEffect, useState} from "react";
import {BrowserProvider, Eip1193Provider, ethers, JsonRpcSigner, Network} from "ethers";
import {DelegateTypes, EthrDID, KeyPair} from "@/utils/ethr/ethr-did";
import {DIDAccount, Holder, JWTWithPayload, W3CCredential} from "@vcnft/core";
import moment from "moment/moment";
import {AccountId} from "caip";
import {apiInstance} from "@/utils/Axios";
import {toast} from "@/components/ui/use-toast";
import {
  createWeb3Modal,
  defaultConfig, useSwitchNetwork,
  useWeb3ModalAccount,
  useWeb3ModalEvents,
  useWeb3ModalProvider
} from "@web3modal/ethers/react";

type WalletContextType = {
  attributes: {
    account: JsonRpcSigner | null,
    activeCredentials: JWTWithPayload<W3CCredential>[],
    balance: bigint,
    balanceUpdated: boolean,
    block: number,
    connected: boolean,
    connecting: boolean,
    ethrDid: EthrDID | null,
    loading: boolean,
    network: Network | null,
    renewing: boolean,
    signingDelegate: { kp: KeyPair, expire: string } | null,
    setup: { state: "SETUP" | "LOADED" | "FAILED", error: any, message: string | null },
    pendingCredentials: any[]
  }

  functions: {
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

const sepolia = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  // explorerUrl: "https://explorer.sepolia.io",
  rpcUrl: "https://sepolia.infura.io/v3/7fd241de721948a78d3d9b5d84d7570c",
}

const metadata = {
  name: 'VCNFT',
  description: 'VCNFT Wallet',
  url: 'https://vcnft.me',
  icons: []
}

const WalletContext = createContext<WalletContextType | null>(null)

export const WalletContextProvider = ({children}: { children: ReactNode }) => {
  const projectId = 'b8a0b12b4aa48f5727fd884c897f5128'

  createWeb3Modal({
    ethersConfig: defaultConfig({metadata}),
    chains: [sepolia],
    projectId,
    enableAnalytics: true // Optional - defaults to your Cloud configuration
  })

  const {address, chainId, isConnected} = useWeb3ModalAccount()
  const {walletProvider} = useWeb3ModalProvider();

  const provider = walletProvider ? new BrowserProvider(walletProvider) : undefined

  useEffect(() => {
    if (isConnected && walletProvider && chainId && address)
      loadWallet(true, walletProvider, chainId, address).then(r => console.log("loaded"))
    else {
      setLoading(false)
      setSetup({state: "LOADED", error: null, message: null})

      unloadWallet()
    }

    // return () => {unloadWallet()};
  }, [isConnected, address, chainId, walletProvider])

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

  const renewDelegate = async (did: EthrDID, addr: string) => {
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
      localStorage.setItem(`wallet.${addr}.signingDelegate`, JSON.stringify(delegate))
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

  async function loadEthrDid(addr: string, network: Network, prov: BrowserProvider) {

    let del;
    if (hasValidDelegate(addr))
      del = await loadDelegate(addr)

    let ethrDid = new EthrDID({
      identifier: addr,
      chainNameOrId: network.chainId,
      provider: prov,
      privateKey: del?.kp.privateKey,
      registry: network.chainId === BigInt(11155111) ? "0x03d5003bf0e79C5F5223588F347ebA39AfbC3818" : undefined
    })

    if (!hasValidDelegate(addr)) {
      console.log("Delegates expired")

      let timePassed = 0
      const inter = setInterval(() => {
        setSetup(s => ({
          ...s, message: `Delegates expired.
                Renewing... This may take a minute(${timePassed}s) \n This will only on your first connection`
        }))
        timePassed += 1
      }, 1000)
      await renewDelegate(ethrDid, addr)

      clearInterval(inter)
    }

    setEthrDid(ethrDid);
  }

  async function updateBalance(addr: string, prov: BrowserProvider) {
    try {
      let b = await prov.getBalance(addr);
      setBalance(v => {
        // console.log("balance", addr, b)
        if (v !== b) setBalanceUpdated(false)
        return b
      })
      return b;
    } catch (e) {
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

    console.log("newCredentials", newCredentials, newTransferredCredentials, resolved, transfers, credentials)

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

  async function loadWallet(connect: boolean = false, prov: Eip1193Provider, chainId: string, addr: string) {
    setSetup({state: "SETUP", error: null, message: "Fetching accounts..."})

    if (connect) {
      const currentProvider = new BrowserProvider(prov)
      const acc = await currentProvider.getSigner()

      setAccount(acc);

      setSetup({state: "SETUP", error: null, message: "Fetching network..."})

      let network = await currentProvider.getNetwork();

      console.log("network", network.chainId, chainId)

      setNetwork(network);

      if (!acc || !network) {
        setSetup({state: "FAILED", error: null, message: "Failed to load blockchain wallet"})
        return;
      }

      currentProvider.on("block", (block) => {
        updateBalance(addr, currentProvider)
        setCurrentBlock(block)
      })

      setSetup({state: "SETUP", error: null, message: "Loading balance..."})

      let bal = await updateBalance(addr, currentProvider)
      if (bal <= BigInt(10000000000000)) {
        setSetup({state: "SETUP", error: null, message: "Balance too low. Requesting refill from faucet..."})
        await faucet(addr, network.chainId.toString())

        if (!hasValidDelegate(addr)) {
          let timePassed = 0
          while (bal <= BigInt(10000000000000)) {
            setSetup({
              state: "SETUP",
              error: null,
              message: `Balance too low. Refilling funds... This may take a minute (${timePassed}s)`
            })
            await new Promise(r => setTimeout(r, 1000))
            timePassed += 1
            bal = await updateBalance(addr, currentProvider)
          }
        }
      }

      setSetup({state: "SETUP", error: null, message: "Loading Ethr DID..."})

      await loadEthrDid(addr, network, currentProvider)

      setSetup({state: "SETUP", error: null, message: "Loading credentials..."})

      await loadCredentials(addr)

      setSetup({state: "SETUP", error: null, message: "Loading block..."})

      setCurrentBlock(await currentProvider.getBlockNumber())

      setLoading(false)
      setSetup({state: "LOADED", error: null, message: null})
    }
  }

  async function unloadWallet() {
    await provider?.removeAllListeners("block")
    setAccount(null)
    setNetwork(null)
    setEthrDid(null)
    setActiveCredentials([])
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
    if (!account || !chainId || !ethrDid) {
      console.warn("Failed to create holder. Missing account, network or ethrDid. ", account, network, ethrDid)
      return null;
    }

    async function signer(message: string) {
      const sign = await account?.signMessage(message)
      if (!sign) throw new Error("Failed to sign message");
      return sign
    }

    return new Holder({
      accountId: new AccountId({
        address: account.address,
        chainId: {namespace: "eip155", reference: chainId}
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
      ethrDid: ethrDid,
      loading: loading,
      network: network,
      renewing: renewing,
      signingDelegate: signingDelegate,
      setup: setup,
      pendingCredentials: pendingCredentials
    },

    functions: {
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
