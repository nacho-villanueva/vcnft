import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {truncateDid} from "@/utils/utils";
import {Button} from "@/components/ui/button";
import {JWTWithPayload, W3CCredential} from "@vcnft/core";
import {useState} from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {CopyIcon, DownloadIcon, TrashIcon} from "@radix-ui/react-icons";
import {CopyInput} from "@/components/ui/CopyInput";

type CredentialCardProps = {
    credential: JWTWithPayload<W3CCredential>,
    onCredentialUnload?: (cred: JWTWithPayload<W3CCredential>) => void
    onVerifyCredential?: (cred: JWTWithPayload<W3CCredential>) => Promise<{
        verified: boolean,
        error?: string
    } | undefined>
}

const CredentialCard = ({credential, onCredentialUnload, onVerifyCredential}: CredentialCardProps) => {
    const issuer = typeof credential.payload?.issuer === "string" ? credential.payload?.issuer : credential.payload?.issuer?.id;

    const [verified, setVerified] = useState<{
        verified: boolean,
        error?: string
    } | undefined>(undefined)
    const [verifying, setVerifying] = useState(false)

    const handleVerifyCredential = () => {
        setVerifying(true)
        onVerifyCredential?.(credential)
            .then(r => setVerified(r))
            .finally(() => setVerifying(false))
    }

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(credential, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${issuer}-${credential.payload.issuanceDate}.json`;
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
    }

    if (!credential.payload) {
      return <Card className={"max-w-[500px] min-w-min w-full p-2"}>
        <pre>
          {credential.jwt}
        </pre>
        <CardContent className={"p-4 flex flex-col justify-center w-full"}>
          <p className={"whitespace-nowrap"}>Invalid Credential</p>
        </CardContent>
        <CardFooter className={"flex flex-wrap justify-between gap-2 w-full px-1 pb-2"}>
          <Button className={"flex-1"} variant={"outline"} onClick={() => onCredentialUnload?.(credential)}>Unload Credential</Button>
        </CardFooter>
      </Card>
    }

    return (
        <Card className={"max-w-[500px] min-w-min w-full p-2"}>
            <CardContent className={"p-4 flex flex-col justify-center w-full"}>
                <p className={"whitespace-nowrap flex items-center"}>
                  <b>Issuer:</b> <CopyInput value={issuer}/>
                </p>
                <p className={"whitespace-nowrap flex items-center"}>
                    <b>Subject:</b> <CopyInput value={credential.payload?.credentialSubject.id}/></p>
                <p className={"whitespace-nowrap"}><b>Issued At:</b> {credential.payload.issuanceDate}</p>
                <p className={"whitespace-nowrap"}><b>Verified:</b> {verifying ?
                    <LoadingSpinner/> :
                    verified === undefined ? <small className={"text-yellow-500/70"}>Waiting for verification...</small>
                        : (verified.verified ? <span className={"text-green-400"}>Verified</span>
                            : <span className={"text-red-400 font-semibold"}>Failed Verification</span>)
                }</p>

                <div className={"mt-2"}><b><u>Claims:</u></b>
                    <ul className={"list"}>
                        {Object.keys(credential.payload.credentialSubject).filter(k => k !== "id").map((key) => (
                            <li key={key}
                                className={"capitalize"}>{key}: {credential.payload.credentialSubject[key]}</li>
                        ))}
                    </ul>
                </div>
            </CardContent>
            <CardFooter className={"flex flex-wrap justify-between gap-2 w-full px-1 pb-2"}>
                <Button variant={"outline"} disabled={verifying} onClick={handleVerifyCredential}>Verify Credential</Button>
              <span className={"flex gap-2"}>
                <Button variant={"outline"} size={"icon"} onClick={handleDownload}><DownloadIcon /></Button>
                <Button variant={"outline"} className={"text-red-500 font-bold"} size={'icon'} onClick={() => onCredentialUnload?.(credential)}><TrashIcon /></Button>
            </span>
              </CardFooter>
        </Card>
    )
}

export default CredentialCard
