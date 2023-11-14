import * as React from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {truncateAddress, truncateDid} from "@/utils/utils";
import {Button} from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {useWallet} from "@/utils/vcnft";
import {apiInstance} from "@/utils/Axios";
import {toast} from "@/components/ui/use-toast";

export const ClaimVCNFTRequest = () => {
  const navigate = useNavigate()
  const {id} = useParams();
  const [request, setRequest] = useState<any | undefined>(undefined);

  const [sending, setSending] = useState(false);

  const walletContext = useWallet();
  if (walletContext === null) return <></>;
  const {attributes, functions} = walletContext;

  useEffect(() => {
    apiInstance.get(`/holder/claim/${id}`)
      .then(r => {
        if (r.data.status !== "PENDING") {
          toast({
            variant: "destructive",
            title: "Invalid Credential Request",
            description: "This credential request is no longer valid. Please request a new one."
          })
          navigate("/wallet")
        } else {
          setRequest(r.data)
        }
      }).catch(r => {
      toast({
        variant: "destructive",
        title: "Problem with request",
        description: "We are having trouble with this request. Please try again later or request new one."
      })
    });
  }, []);

  const isOnChain = attributes.network?.chainId.toString() === request?.chainId?.split(":")[1];

  const handleOpenChange = (open: boolean) => {
    if (!open) navigate("/wallet")
  }

  const handleSend = async () => {
    setSending(true)
    apiInstance.post(`/holder/claim/${id}`, {
      address: attributes.account?.address,
    }).then(r => {
      toast({
        title: "Credential Claimed",
        description: "You have successfully claimed this credential."
      })

      functions.handleAddPendingCredential({
        id: id,
        issuer: request.issuerDID,
        claims: JSON.parse(request.claims),
      })

      navigate("/wallet")
    }).catch(r => {
      toast({
        variant: "destructive",
        title: "Problem with Claim",
        description: "We had a problem claiming this credential. Please try again later or ask for a new one."
      })
    });
  }

  const handleCancel = () => handleOpenChange(false)

  return (
    <Dialog open={attributes.connected} onOpenChange={handleOpenChange}>
      <DialogContent>
        {!request && <div className={"flex flex-col gap-4"}>
          <LoadingSpinner/>
          <span className={"text-center"}>Loading...</span>
        </div>}
        {!!request && (<><DialogHeader>
          <DialogTitle>Credential Verification</DialogTitle>
          <DialogDescription>
            You are about to claim the ownership of an asset. Validate all of the information is valid. <br/><br/>
          </DialogDescription>
        </DialogHeader>
          <div className={"text-left"}>
            Your Address: <b>{truncateAddress(attributes.account?.address)}</b> <br/>
            Chain: <b>{attributes.network?.name}</b> <br/>
            Issuer: <b>{truncateDid(request?.issuerDID)} ({request.issuerName})</b>
          </div>
          {!isOnChain && <small className={"text-yellow-500"}>
            The credential will be emitted on a different network than the one you are currently on.
            Make this is your desired credential.
            <br/>Credential Network: <b>{request?.chainId?.split(":")[1]}</b>
            <br/>Your Network: <b>{attributes.network?.chainId.toString()}</b>
          </small>}
          <small>Claims: <br/></small>
          <div className={"flex flex-col"}>
            {Object.entries(JSON.parse(request?.claims)).map(([key, value], i) => (
              <div className={"flex gap-1 items-center"} key={i}>
                <label className={"capitalize text-sm"}>{key}: </label>
                <span className={"font-semibold"}>{value as string}</span>
              </div>
            ))}
          </div>
          <div className={"flex gap-4 justify-between"}>
            <Button variant={"ghost"} onClick={handleCancel}>
              Cancel
            </Button>

            <Button onClick={handleSend} disabled={sending || !request}>
              {!sending && "Claim"}
              {sending && <LoadingSpinner/>}
            </Button>
          </div>
        </>)}
      </DialogContent>
    </Dialog>
  );
};
