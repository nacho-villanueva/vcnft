'use client';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from '@nextui-org/react';
import { vcnftApi } from '@vcnft/demo-frontend/utils/Axios';
import { useDID } from '@vcnft/demo-frontend/hooks/UseDID';
import { ethers, JsonRpcSigner } from 'ethers';
import { useEffect, useState } from 'react';
import { DelegateTypes, EthrDID } from 'ethr-did';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';

export default function WalletPage() {
  const rpcUrl =
    'https://goerli.infura.io/v3/7fd241de721948a78d3d9b5d84d7570c';
  const didResolver = new Resolver(getResolver({ infuraProjectId: "7fd241de721948a78d3d9b5d84d7570c" }));
  const eth = typeof window !== 'undefined' ? (window as any).ethereum : undefined;
  const provider = new ethers.BrowserProvider(eth);

  const { dids, addDID } = useDID();

  const query = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [defaultAccount, setDefaultAccount] = useState<JsonRpcSigner | null>(
    null
  );
  const [userBalance, setUserBalance] = useState<string | null>(null);
  const [ethrDid, setEthrDid] = useState<EthrDID | null>(null);

  useEffect(() => {
    if (query?.has('challenge')) {
      if (eth) {
        provider.getSigner().then(async (signer) => {
          signer
            .signMessage(query.get('challenge') as string)
            .then((signature) => {
              vcnftApi.post('/holder/challenge', {
                challenge: {
                  message: query.get('challenge') as string,
                  signature: signature,
                },
              });
            });
        });
      }
    }
  });

  const setDid = async () => {
    const signer = await provider.getSigner();
    const chainNameOrId = (await provider.getNetwork()).chainId;
    const ethrDid = new EthrDID({
      identifier: signer.address,
      provider,
      chainNameOrId,
    });
    setEthrDid(ethrDid);
  };

  const sign = async () => {
    if (ethrDid) {
      const resolved = await didResolver.resolve(ethrDid.did)
      console.log(resolved)
      const didDocument = resolved.didDocument;
      console.log('document', didDocument);

      const helloJWT = await ethrDid.signJWT({hello: 'world'})
      console.log(helloJWT)

      try {
        const {payload, issuer} = await ethrDid.verifyJWT(helloJWT, didResolver);
        // `issuer` contains the DID of the signing identity
        console.log(issuer)
      } catch (e) {
        console.error('unable to verify JWT: ', e)
      }
    }
  };

  const addDelegate = async () => {
    if (ethrDid) {
      const delegate = await ethrDid.createSigningDelegate();
      console.log(delegate);
    }
  }

  const connectWalletHandler = () => {
    if (eth) {
      provider.send('eth_requestAccounts', []).then(async () => {
        const signer = await provider.getSigner();
        await accountChangedHandler(signer);
      });
    } else {
      console.log('Please Install Metamask!!!');
      setErrorMessage('Please Install Metamask!!!');
    }
  };
  const accountChangedHandler = async (newAccount: JsonRpcSigner) => {
    setDefaultAccount(newAccount);
  };

  const createIdentity = () => {
    vcnftApi.get('/identity/create').then((response) => {
      addDID(response.data);
    });
  };

  return (
    <div className={'flex justify-center items-center flex-1'}>
      <Card className="w-full max-w-[600px]">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <h1>VCNFT Car Registry Wallet </h1>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <h2 className="text-sm">Create a new identity</h2>
          <Button variant={'bordered'} onClick={createIdentity}>Create</Button>
          <Divider className={'my-4'} />
          <h2 className="text-sm">Import an existing identity</h2>
          <Button variant={'bordered'}> Import </Button>
          <Divider className={'my-4'} />
          <h2 className="text-sm">Add Blockchain Wallet</h2>
          {!defaultAccount && (
            <Button variant={'bordered'} onClick={connectWalletHandler}>Connect Wallet</Button>
          )}
          {!!defaultAccount && <p>{defaultAccount.address}</p>}

          {!ethrDid && <Button variant={'bordered'} onClick={setDid}>Set Did</Button>}
          {!!ethrDid && <p>{ethrDid.did}</p>}

          <Button variant={'bordered'} onClick={sign}>Sign</Button>
          <Button variant={'bordered'} onClick={addDelegate}>Add Delegate</Button>
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col">
          <h2>Imported DIDs</h2>
          <p className={''}>Ethr: {ethrDid?.did}</p>
          <ul className="w-full">
            {dids.map((did) => {
              return (
                <li key={did.longDid} className={'w-full truncate'}>
                  {did.longDid}
                </li>
              );
            })}
          </ul>
        </CardFooter>
      </Card>
    </div>
  );
}
