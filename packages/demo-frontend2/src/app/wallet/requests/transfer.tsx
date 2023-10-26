import * as React from 'react';
import {useWallet} from "@/utils/vcnft";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import {useLocation} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {truncateAddress} from "@/utils/utils";

export const TransferDialog = () => {
    const walletContext = useWallet();
    if (walletContext === null) return <></>;
    const {attributes, functions} = walletContext;
    const [open, setOpen] = React.useState(false);

    const url = `${import.meta.env.VITE_BASE_URL}/wallet/transfer/${attributes.account?.address}?network=${attributes.network?.chainId}`

    return (
        <Dialog open={attributes.connected && open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"outline"} className={"w-full"}>Receive Transfer</Button>
            </DialogTrigger>
            <DialogContent style={{
                maxWidth: "min(98v, 32rem)"
            }}>
                <DialogHeader>
                    <DialogTitle>Receive Credentials</DialogTitle>
                    <DialogDescription>
                       Give this QR code to whoever you want to receive credentials from.
                        Refresh your page to see new credentials.
                    </DialogDescription>
                </DialogHeader>
                    <div>
                        <span>You will be receiving to:</span><br />
                        <span className={"text-sm"}>Address: <b>{truncateAddress(attributes.account?.address)}</b></span><br />
                        <span className={"text-sm"}>Network: <b>{attributes.network?.name}</b></span><br />
                    </div>

                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={url}
                        viewBox={`0 0 256 256`}
                    />
            </DialogContent>
        </Dialog>
    );
};
