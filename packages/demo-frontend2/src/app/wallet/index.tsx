import {Card, CardContent, CardDescription, CardFooter, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ethers, JsonRpcSigner, Network} from "ethers";
import {FormEvent, useEffect, useRef, useState} from "react";
import {truncateAddress, truncateDid} from "@/utils/utils";
import {DelegateTypes, EthrDID, KeyPair} from "@/utils/ethr/ethr-did";
import {createVerifiablePresentationJwt, Issuer, JwtPresentationPayload} from "did-jwt-vc";
import {DIDAccount, generateOwnershipProofMessage, Holder, JWTWithPayload, W3CCredential} from "@vcnft/core";
import moment from "moment";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {AccountId} from "caip";

function Wallet() {
  const eth = typeof window !== 'undefined' ? (window as any).ethereum : undefined;
  const provider = new ethers.BrowserProvider(eth);

  const [account, setAccount] = useState<JsonRpcSigner | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [ethrDid, setEthrDid] = useState<EthrDID | null>(null);
  const [signingDelegate, setSigningDelegate] = useState<{kp: KeyPair, expire: string} | null>(null);
  const [activeCredentials, setActiveCredentials] = useState<any[]>([]);

  const [connecting, setConnecting] = useState(false);
  const [renewing, setRenewing] = useState(false);

  const [loading, setLoading] = useState(true);

  const inputFileRef = useRef<HTMLInputElement>(null);


  function loadDelegate() {
    const delegate = localStorage.getItem("wallet.signingDelegate")
    if (!delegate) return null;

    const parsed = JSON.parse(delegate)
    setSigningDelegate(parsed)

    return parsed
  }

  function loadEthrDid(account:JsonRpcSigner, network:Network) {
    const del = loadDelegate()

    const ethrDid = new EthrDID({
      identifier: account.address,
      chainNameOrId: network.chainId,
      provider: provider,
      privateKey: del?.kp.privateKey
    })

    console.log(ethrDid)

    setEthrDid(ethrDid);
  }

  function loadCredentials() {
    const credentials = localStorage.getItem("wallet.vcnft")
    if (credentials) setActiveCredentials(JSON.parse(credentials))
  }

  useEffect(() => {
    if(account && network) {
      const ethrDid = new EthrDID({
        identifier: account.address,
        chainNameOrId: network.chainId,
        provider: provider
      })

      setEthrDid(ethrDid);
    }
  }, [account?.address, network?.chainId]);

  useEffect(() => {
    async function loadWallet() {
      if(eth) {
        provider.listAccounts().then(async (acc) => {
          if (acc.length > 0){
            const acc = await provider.getSigner();
            setAccount(acc);

            const network = await provider.getNetwork();
            setNetwork(network);

            if(acc && network) loadEthrDid(acc, network)
          }
        })
          .finally(() => setLoading(false))
        loadCredentials()
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
      }
      catch (e) {
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
      }
      catch (e) {
        setRenewing(false)
      }
      setRenewing(false)
    }
  }

  const handleImportVCNFTClick = () => {
    if(inputFileRef.current) {
      inputFileRef.current.click();
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

  const handleUnloadCredential = (cred: any) => {
    let credentials = JSON.parse(localStorage.getItem("wallet.vcnft") ?? "[]")
    credentials = credentials.filter((c: any) => c.jwt !== cred.jwt)
    localStorage.setItem("wallet.vcnft", JSON.stringify(credentials))
    setActiveCredentials(credentials)
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
      signer: signer}, ethrDid as DIDAccount)
  }

  const createPresentation = async (cred: JWTWithPayload<W3CCredential>) => {
    const holder = createVcnftHolder()
    if (!holder) return;
    const pay = await holder.generatePresentationPayload([cred])
    const jwt = await holder.signPresentation(pay)
    console.log(jwt)
  }

  return (
    <div className={"p-5 min-w-screen min-h-screen flex flex-col items-center justify-center"}>
      <Card className={"max-w-[500px] w-full p-2"}>
        {!loading && <>{!account && <><CardTitle className={"text-center"}>
          VCNFT Wallet
        </CardTitle>
        <CardDescription className={"text-center"}>
          Manage your decentralized identity in one place.
        </CardDescription></>}
        <CardContent className={"p-4 flex justify-center w-full"}>
          {!account && <ConnectWalletButton onConnect={connectWalletHandler} connecting={connecting}/>}
          {account && <div>
            <p><b>Address:</b> {truncateAddress(account.address)}</p>
            <p><b>DID:</b> {truncateDid(ethrDid?.did ?? "")}</p>
            <p><b>Network:</b> <span className={"capitalize"}>{network?.name}</span></p>
            <div className={"flex items-center gap-3"}>
            <p><b>Signer Expiration:</b>&nbsp;
              {renewing ? <>Renewing... <LoadingSpinner /></>
                : (!!signingDelegate ? moment(signingDelegate.expire).local().format("DD MMM YYYY")
                  : <b className={"text-red-500"}>Expired</b>)}</p>
              {!renewing && <Button size={"sm"} disabled={renewing} variant={"secondary"} className={"text-xs p-1 h-5"} onClick={renewDelegate}>Renew Delegate</Button>}
            </div>
            {renewing && <small className={"text-yellow-400"}>This can take a minute<br/></small>}
            <br />
            <Button variant={"outline"} className={"w-full"} onClick={handleImportVCNFTClick}>Import VCNFT</Button>
            <Button variant={"outline"} className={"w-full"}>Export Wallet</Button>
          </div>}
        </CardContent></>}
        {loading && <div className={"w-full min-h-[150px] flex items-center justify-center"}>
          <LoadingSpinner size={12} color={"text-yellow-600"}/>
        </div>
        }
      </Card>
      {
        activeCredentials.map((cred, i) => (
          <CredentialCard key={i} credential={cred} onCreatePresentation={createPresentation} onCredentialUnload={handleUnloadCredential}/>
        ))
      }
      <input type={"file"} hidden ref={inputFileRef} onInput={handleImportVCNFT} />
    </div>
  );
}

export default Wallet


type CredentialCardProps = {
  credential: any,
    onCreatePresentation?: (cred: any) => void
  onCredentialUnload?: (cred: any) => void
}

const CredentialCard = ({credential, onCreatePresentation, onCredentialUnload}: CredentialCardProps) => {

  function verifyCredential() {

  }

  return (
    <Card className={"max-w-[500px] w-full p-2"}>
      <CardContent className={"p-4 flex flex-col justify-center w-full"}>
        <p>Issuer: {truncateDid(credential.payload.issuer)}</p>
        <p>Subject: {truncateDid(credential.payload.credentialSubject.id)}</p>
        <p>Issued At: {credential.payload.issuanceDate}</p>
        <div>Claims:
          <ul>
            {Object.keys(credential.payload.credentialSubject).filter(k => k !== "id").map((key) => (
              <li key={key}>{key}: {credential.payload.credentialSubject[key]}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant={"outline"} onClick={() => onCreatePresentation?.(credential)}>Create Presentation</Button>
        <Button variant={"outline"}>Verify Credential</Button>
        <Button variant={"outline"} onClick={() => onCredentialUnload?.(credential)}>Unload Credential</Button>
      </CardFooter>
    </Card>
  )
}

const ConnectWalletButton = ({onConnect, connecting}: { onConnect: () => void, connecting: boolean}) => {
  const eth = typeof window !== 'undefined' ? (window as any).ethereum : undefined;
  return (<div className={"flex flex-col items-center w-full"}>
      <Button variant={"ghost"}
              className={"bg-orange-500/30 hover:bg-orange-500/90 hover:text-white/95 font-semibold w-1/2"}
              onClick={onConnect} disabled={!eth || connecting}>
        {!connecting ? "Connect Metamask" : <><LoadingSpinner /> Connecting...</>}
      </Button>
      {!eth && (
        <div className={"text-center"}>
          <p className={"text-red-500"}>Uh oh. Seems like you don't have Metamask.</p>
          <p className={"text-red-500"}>Please install Metamask to continue</p>
        </div>
      )}
    </div>
  )
}
