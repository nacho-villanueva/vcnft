// @flow
import * as React from 'react';
import {useWallet} from "@/utils/vcnft";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {getEthScanLink, truncateAddress, truncateDid} from "@/utils/utils";
import {Button} from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {useState} from "react";
import {Contract} from "ethers";
import {atRule} from "postcss";
import {toast} from "@/components/ui/use-toast";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import axios from "axios";
import {apiInstance} from "@/utils/Axios";

export const TransferAction = () => {
    const navigate = useNavigate()
    const {address} = useParams();
    let [searchParams, setSearchParams] = useSearchParams();
    const [subject, setSubject] = useState<string | undefined>(undefined);
    const [removeOnTrasnfer, setRemoveOnTransfer] = useState(true)

    const [sending, setSending] = useState(false);

    const walletContext = useWallet();
    if (walletContext === null) return <></>;
    const {attributes, functions} = walletContext;

    const validNftDid = new Set((attributes.activeCredentials
        .map(c => c.payload.credentialSubject.id)
        .filter(did => did !== undefined) as string[]))

    const subjectClaims = attributes.activeCredentials
        .filter(c => c.payload.credentialSubject.id === subject)
        .map(c => Object.entries(c.payload.credentialSubject))
        .flat()
        .filter(([key, value]) => key != "id")

    const isSubjectOnChain =  subject?.split(":")[2].split("_")[1] === searchParams.get("network")

    const handleOpenChange = (open: boolean) => {
        if (!open) navigate("/wallet")
    }

    const handleCancel= () => handleOpenChange(false)

    const handleSend = async () => {
        setSending(true)
        const holder = functions.createVcnftHolder()
        if(!holder || !subject) return;

        const tx = holder.getTransferNftDidTxDetails(subject)
        const contract = new Contract(
            tx.assetId.assetName.reference,
            tx.abi,
            attributes.account
        )

        contract.getFunction("safeTransferFrom").send(attributes.account?.address, address, tx.assetId.tokenId)
            .then(r => {
                toast({
                    title: "Transfer Sent",
                    description: <pre>
                        <span>Asset: {truncateDid(subject)}</span><br />
                        <span className={"break-word"}>To: {truncateAddress(address)}</span><br />
                        <span className={"w-full break-word"}>Tx ID: {r.hash}</span><br />
                        <a href={getEthScanLink(r.hash, attributes.network!)} target={"_blank"}
                        >Checkout on etherscan</a>
                    </pre>
                })

                const credentialsToSend = attributes.activeCredentials
                    .filter(c => c.payload.credentialSubject.id === subject)

                const serialized = credentialsToSend.map(c => JSON.stringify(c))

                apiInstance.put(`/holder/credential/transfer/${address}`, {
                    credentials: serialized,
                })

                if (removeOnTrasnfer) {
                    credentialsToSend.forEach(c => functions.handleUnloadCredential(c))
                }

            })
            .catch(e => {
                toast({
                    title: "Transfer Failed",
                    description: "Verify you are the owner of this asset.",
                    variant: "destructive"
                })
            })
            .finally(handleCancel)
    }

    return (
        <Dialog open={attributes.connected} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Credential Verification</DialogTitle>
                    <DialogDescription>
                        You are about to transfer the ownership of an asset <br />
                        To: <b>{truncateAddress(address)}</b> <br />
                        Chain: <b>{searchParams.get("network")}</b>
                    </DialogDescription>
                </DialogHeader>
                    <label>Presentation subject:</label>
                    <Select value={subject} onValueChange={setSubject} disabled={sending}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a subject..."/>
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from(validNftDid).map((c, i) => (
                                <SelectItem key={c} value={c}>{truncateDid(c, 35, 10)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!!subject && !isSubjectOnChain && <span className={"text-red-500"}>This asset is not on the same chain as requested. Please choose another asset in the same chain or ask for a new request on this chain.</span>}
                    <div className={"flex flex-wrap gap-8"}>
                        {subjectClaims.map(([key, value]) => (
                            <div className={"flex gap-1 items-center"}>
                                <label className={"capitalize text-sm"}>{key}: </label>
                                <span className={"font-semibold"}>{value}</span>
                            </div>
                        ))}
                    </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="terms2" checked={removeOnTrasnfer} onCheckedChange={(state) => setRemoveOnTransfer(!!state.valueOf)}/>
                    <label
                        htmlFor="terms2"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Remove all credentials associated with this asset from your wallet.
                    </label>
                </div>
                <div className={"flex gap-4 justify-between"}>
                    <Button variant={"ghost"} onClick={handleCancel}>
                        Cancel
                    </Button>

                    <Button onClick={handleSend} disabled={sending || !subject}>
                        {!sending && "Send"}
                        {sending && <LoadingSpinner />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
