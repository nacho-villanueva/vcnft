import {useNavigate, useNavigation, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {apiInstance} from "@/utils/Axios";
import {useWallet} from "@/utils/vcnft";
import {toast} from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn, truncateDid} from "@/utils/utils";
import {Button} from "@/components/ui/button";
import axios from "axios";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type PresentationRequest = {
  _id: string,
  claims: Array<string>,
  status: string,
}

const WalletVerify = () => {
  const navigate = useNavigate()
  const {id} = useParams();
  const [request, setRequest] = useState<PresentationRequest | undefined>(undefined);

  const [subject, setSubject] = useState<string | undefined>(undefined);

  const [sending, setSending] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);

  const walletContext = useWallet();
  if (walletContext === null) return <></>;
  const {attributes, functions} = walletContext;

  useEffect(() => {
    apiInstance.get<PresentationRequest>(`/holder/verify/${id}`)
      .then(r => {
        if (r.data.status !== "PENDING") {
          toast({
            variant: "destructive",
            title: "Invalid Request",
            description: "This request has already been completed."
          })
          return;
        }

        setRequest(r.data)
        console.log(r.data)
      })
  }, []);
  const handleOpenChange = (open: boolean) => {
    if (!open) navigate("/wallet")
  }

  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [resolver, setResolver] = useState<(value: boolean | PromiseLike<boolean>) => void>();

  const handleConfirmSuccess = () => {
    setUserChoice(true);
    setOpenConfirm(false);
  };

  const handleConfirmCancel = () => {
    setUserChoice(false);
    setOpenConfirm(false);
  };

  const handleConfirmOpenChange = (open: boolean) => {
    if (!open) {
      setUserChoice(false);
      setOpenConfirm(false);
    } else {
      setUserChoice(null);
      setOpenConfirm(true);
    }
  }

  useEffect(() => {
    if (!openConfirm && resolver && userChoice !== null) {
      resolver(userChoice);
      // Reset userChoice and resolver after resolving
      setUserChoice(null);
      setResolver(undefined);
    }
  }, [openConfirm, resolver, userChoice]);

  async function requestConfirmation(): Promise<boolean> {
    setOpenConfirm(true);

    return new Promise<boolean>(resolve => {
      setResolver(() => resolve);
    });
  }

  const handleSend = async () => {
    if (!request) return;
    setSending(true)

    let claimsNeeded = [...request?.claims.map(c => c.toLowerCase())];

    let credentials = []

    const subjectCredentials = attributes.activeCredentials.filter(c => c.payload.credentialSubject.id === subject)

    for (const cred of subjectCredentials) {
      const credClaims = Object.keys(cred.payload.credentialSubject)
        .map(c => c.toLowerCase())
      if (credClaims.some(c => claimsNeeded.includes(c))) {
        credentials.push(cred)
        claimsNeeded = claimsNeeded.filter(c => !credClaims.includes(c))
      }
    }

    console.log(claimsNeeded)

    if (claimsNeeded.length > 0) {
      const confirm = await requestConfirmation()
      if (!confirm) {
        setSending(false)
        return;
      }
    }

    const presentation = await functions.createPresentation(credentials)

    apiInstance.post(`/holder/verify/${id}`, {
      presentation: presentation,
    }).then(r => toast({
      title: "Presentation Sent",
      description: "Your presentation has been sent to the verifier.",
    }))
      .catch(r => toast({
        variant: "destructive",
        title: "Presentation Failed",
        description: "There was an error sending your presentation. Please try again.",
      }))
      .finally(() => handleOpenChange(false))
  }
  const handleCancel = () => handleOpenChange(false)

  const credentialOptions = new Set(attributes.activeCredentials
    .map(c => c.payload.credentialSubject.id).filter(c => c !== undefined)) as Set<string>

function subjectHasAllClaims(subject: string) {
  const subjectClaims = attributes.activeCredentials
    .filter(c => c.payload.credentialSubject.id === subject)
    .map(c => Object.keys(c.payload.credentialSubject))
    .flat()
    .filter(key => key != "id")
    .map(key => key.toLowerCase())

  return request?.claims.every(c => subjectClaims.includes(c.toLowerCase()))
}

  const subjectClaims = attributes.activeCredentials
    .filter(c => c.payload.credentialSubject.id === subject)
    .map(c => Object.entries(c.payload.credentialSubject))
    .flat()
    .filter(([key, value]) => key != "id")

  const missingClaims = request?.claims.filter(c => !subjectClaims.map(([key, value]) => key.toLowerCase()).includes(c.toLowerCase()))

  return (
    <Dialog open={attributes.connected} onOpenChange={handleOpenChange}>
      <Dialog open={openConfirm} onOpenChange={handleConfirmOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Missing Claims</DialogTitle>
            <DialogDescription>
              You are missing some claims that are required for this presentation. This won't pass the verification.
              Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <div className={"flex gap-4 justify-between"}>
            <Button variant={"ghost"} onClick={handleConfirmCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSuccess}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credential Verification</DialogTitle>
          <DialogDescription>
            You are about to verify a credential request. These are the claims requested: &nbsp;
            <span className={"font-bold capitalize"}>{request?.claims.join(", ")}</ span>
          </DialogDescription>
          <label>Presentation subject:</label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a subject..."/>
            </SelectTrigger>
            <SelectContent>
              {Array.from(credentialOptions).map((c, i) => (
                <SelectItem value={c} className={cn(!subjectHasAllClaims(c) && "bg-red-100", "cursor-pointer")}>
                  {truncateDid(c, 35, 10)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!!missingClaims && missingClaims.length > 0 &&
            <div className={"flex gap-2 items-center"}>
              <label>Missing Claims:</label>
              <div className={"flex flex-wrap gap-2"}>
                {missingClaims?.map(c => (
                  <span className={"bg-red-500 text-sm text-white px-2 py-1 rounded-sm capitalize"}>{c}</span>
                ))}
              </div>
            </div>
          }
          <div className={"flex flex-wrap gap-8 gap-y-0"}>
            {subjectClaims.map(([key, value]) => (
              <div className={"flex gap-1 items-center"}>
                <label className={"capitalize text-sm"}>{key}: </label>
                <span className={"font-semibold"}>{value}</span>
              </div>
            ))}
          </div>
        </DialogHeader>
        <div className={"flex gap-4 justify-between"}>
          <Button variant={"ghost"} onClick={handleCancel}>
            Cancel
          </Button>

          <Button onClick={handleSend} disabled={sending || !subject}>
            {!sending && "Send"}
            {sending && <LoadingSpinner/>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default WalletVerify;
