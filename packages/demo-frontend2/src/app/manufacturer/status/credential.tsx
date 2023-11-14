// @flow
import * as React from 'react';
import {ReactNode, useEffect, useState} from 'react';
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Link, useParams} from "react-router-dom";
import {AiFillCaretLeft} from "react-icons/ai";
import {apiInstance} from "@/utils/Axios";
import {cn, truncateAddress, truncateDid} from "@/utils/utils";
import moment from "moment";
import {Skeleton} from "@/components/ui/skeleton";
import {toast} from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";

const Credential = ({issuer}: { issuer: string }) => {
  const [data, setData] = useState<Record<any, any>>({});
  const [loading, setLoading] = useState(true);
  const {id} = useParams();

  useEffect(() => {
    apiInstance.get(`/issuer/${issuer}/issue/vcnft/${id}`)
      .then(r => {
        console.log(r.data);
        setData(r.data)
      })
      .catch(r => {
        if (r.response.status === 500) {
          toast({
            variant: "destructive",
            title: "Server Error",
            description: "We are having trouble with this request. Please try refreshing later."
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const isIssued = data.status === "ISSUED";
  const isPending = data.status === "PENDING";

  const nftDid = isIssued ? data.credential?.payload?.credentialSubject?.id : undefined;

  const handleCredentialExport = () => {
    const credential = JSON.stringify(data.credential);
    const blob = new Blob([credential], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.issueParams._id}.jwt`;
    a.click();
  }

  const showQr = () => {
    const credential = JSON.stringify(data.credential);
    const blob = new Blob([credential], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  // const handleSendToWallet = () => {
  //   apiInstance.post(`/issuer/${issuer}/issue/vcnft/${id}/send`)
  //     .then(r => {
  //       toast({
  //         title: "Sent to wallet",
  //         description: "Refresh wallet to see new credential"
  //       })
  //     })
  //     .catch(r => {
  //       if (r.response.status === 500) {
  //         toast({
  //           variant: "destructive",
  //           title: "Server Error",
  //           description: "We are having trouble with this request. Please try refreshing later."
  //         })
  //       }
  //     })
  // }

  function getStatusText() {
    switch (data.status) {
      case "ISSUED":
        return <b className={"text-green-500"}>Issued</b>;
      case "CLAIMED":
        return <b className={"text-blue-500"}>Claimed. Issuing NFT.</b>;
      case "PENDING":
        return <b className={"text-yellow-500"}>Pending Claim</b>;
      case "FAILED":
        return <b className={"text-red-500"}>Failed Issue</b>;
    }
  }

  const claimUrl = `${import.meta.env.VITE_BASE_URL}/wallet/claim/${data.issueParams?._id}`

  return (<>
      <div className={"flex w-full justify-start px-2"}>
        <Button variant={"link"} asChild><Link to={"/manufacturer/status"}><AiFillCaretLeft/>Back</Link></Button>
      </div>
      {loading && <CredentialSkeleton/>}
      {!loading && <Card className={"max-w-[400px] w-full"}>
        <CardHeader>
          VCNFT Credential
          <small className={"capitalize"}>Status: {getStatusText()}</small>
        </CardHeader>
        <CardContent className={"max-w-[400px] w-full"}>
          <Attribute
            label={"Credential ID"}
            value={data.issueParams?._id}
          />
          <Attribute
            label={"Issuer"}
            value={truncateDid(data.issueParams?.issuerDID) + " (" + data.issueParams?.issuerName + ")"}
          />
          <Attribute
            label={"For"}
            value={data.issueParams?.forAddress ? truncateAddress(data.issueParams?.forAddress) : "Pending"}
            pending={!data.issueParams?.forAddress}
          />
          <Attribute
            label={"Issued"}
            value={moment(data.issueParams?.issuedAt).format("MMM DD YYYY")}
          />
          <br/>

          <small><b>Subject: </b></small>
          <Attribute
            label={"NFT DID"}
            value={isIssued ? truncateDid(nftDid, 25) : "Pending"}
            pending={!nftDid}
          />
          {!!data.issueParams?.claims && <div>
            <p>Claims:</p>
            <ul className={"list-disc px-4 text-sm"}>
              {Object.entries(JSON.parse(data.issueParams?.claims)).map(([key, value]) => (
                <li key={key}><span className={"capitalize"}>{key}:</span> <b>{!!value && JSON.stringify(value)}</b>
                </li>
              ))}
            </ul>
          </div>}
        </CardContent>
        <CardFooter className={"flex justify-end gap-4"}>
          {
            isPending && (<ClaimQRDialog
              network={data.issueParams.chainId}
              url={claimUrl}
            />)
          }
          {isIssued && (<>
            <Button variant={"ghost"} size={"sm"} disabled={!isIssued} onClick={handleCredentialExport}>
            Export Credential</Button>
            <Button variant={"ghost"} size={"sm"} disabled={!isIssued}>Resend to Wallet</Button>
          </>)}
        </CardFooter>
      </Card>
      }
    </>
  );
};
export default Credential;

const CredentialSkeleton = () => {
  return (<Card className={"max-w-[400px] w-full"}>
    <CardHeader>
      <Skeleton className={"h-8 w-1/3"}/>
      <Skeleton className={"h-3 w-1/3"}/>
    </CardHeader>
    <CardContent className={"flex flex-col gap-3"}>
      <Skeleton className={"h-6 w-full"}/>
      <Skeleton className={"h-6 w-full"}/>
      <Skeleton className={"h-4 w-1/3"}/>
      <Skeleton className={"h-4 w-1/3"}/>
      <br/>

      <Skeleton className={"h-3 w-1/5"}/>
      <Skeleton className={"h-6 w-1/2"}/>
      <Skeleton className={"h-6 w-1/2"}/>

    </CardContent>
  </Card>)
}

const Attribute = ({label, value, pending}: { label: string, value: string, pending?: boolean }) => {
  return (
    <p><span className={"text-sm"}>{label}:</span> <b className={cn(pending && "text-yellow-500")}>{value}</b></p>
  )
}

const ClaimQRDialog = ({network, url}: {network: string, url: string}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"secondary"} size={"sm"}>Open Claim QR</Button>
      </DialogTrigger>
      <DialogContent style={{
        maxWidth: "min(98v, 32rem)"
      }}>
        <DialogHeader>
          <DialogTitle>Claim Credential QR</DialogTitle>
          <DialogDescription>
            Show this QR to whoever needs to claim this credential.
          </DialogDescription>
        </DialogHeader>
        <div>
          <span className={"text-sm"}>Network: <b>{network}</b></span><br />
        </div>

        <QRCode
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={url}
          viewBox={`0 0 256 256`}
        />
      </DialogContent>
    </Dialog>
  )
}
