// @flow
import * as React from 'react';
import {Link, useParams} from "react-router-dom";
import {useEffect} from "react";
import {apiInstance} from "@/utils/Axios";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {CheckCircledIcon, CrossCircledIcon} from "@radix-ui/react-icons";
import QRCode from "react-qr-code";
import {Button} from "@/components/ui/button";
import {toast} from "@/components/ui/use-toast";
import {AiFillCaretLeft} from "react-icons/ai";

export const VerifyRequest = () => {

    const {id} = useParams();
    const [loading, setLoading] = React.useState(true);
    const [request, setRequest] = React.useState<any>(null);

    function getRequest() {
        setLoading(true)
        apiInstance.get(`/verifier/verify/${id}`)
            .then(r => {
                setRequest(r.data)
            })
            .catch(e => {
                toast({
                    variant: "destructive",
                    title: "There was a server error",
                    description: "Please try again later."
                })
            })
            .finally(() => setLoading(false))
    }

    const url = `${import.meta.env.VITE_BASE_URL}/wallet/verify/${id}`

    useEffect(() => {
        getRequest()
    }, []);

    return (
        <div className={"flex flex-col p-6 items-center gap-4 w-full"}>
            <h1 className={"text-2xl font-semibold"}>Verify Request</h1>
            {loading && <LoadingSpinner />}
            {!loading && request && request.status !== "PENDING" && request.verified && (
                <div className={"flex flex-col gap-4 w-full"}>
                    <p className={"flex items-center"}>Verification:&nbsp;<b className={"text-green-500 flex items-center"}>Verified <CheckCircledIcon /></b></p>
                    <p className={"w-full break-all"}>Holder: <b>{request.holder}</b></p>
                    <p className={"w-full break-all"}>Subject: <b>{request.subject}</b></p>
                    <p>Claims:</p>
                    <ul className={"list-disc px-4 text-sm"}>
                        {Object.entries(request.claims).map((entry) => (
                            <li key={entry[0]}>{entry[0]}: <b>{entry[1] as string}</b></li>
                        ))}
                    </ul>
                </div>
            )}

            {!loading && request && request.status !== "PENDING" && !request.verified &&(
                <div className={"flex flex-col gap-4"}>
                    <div>
                    <p className={"flex items-center"}>Verification:&nbsp;<b className={"text-red-500 flex items-center"}>Failed Verification <CrossCircledIcon /></b></p>
                        <p className={"mb-0"}>Reason:</p>
                        <ul className={"list-disc px-4 text-sm"}>
                            {request.metadata.map((m: any) => (
                                <li key={m.message}>{m.message}</li>
                            ))}
                        </ul>
                    </div>
                    <br />

                    <p className={"w-full break-all"}>Holder: <b>{request.holder}</b></p>
                    <p className={"w-full break-all"}>Subject: <b>{request.subject}</b></p>

                    <div>
                        <p>Claims:</p>
                        <small className={"text-yellow-500"}>This claims could be forged. Do not trust.</small>
                        <ul className={"list-disc px-4 text-sm"}>
                            {Object.entries(request.claims).map((entry) => (
                                <li key={entry[0]}>{entry[0]}: <b>{entry[1] as string}</b></li>
                            ))}
                        </ul>
                    </div>

                </div>
            )}

            {!loading && request && request.status === "PENDING" && (
                <div className={"flex flex-col gap-4"}>
                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={url}
                        viewBox={`0 0 256 256`}
                    />
                    <br />
                    <br />
                    <br />

                    <small>Refresh the status once the verification is sent</small>
                    <Button onClick={getRequest} variant={"secondary"} className={"f-full"}>
                        Refresh Status
                    </Button>
                </div>
            )}
            <div className={"flex justify-end w-full"}>
                <Button variant={'secondary'} asChild><Link to={"/verifier"}>New Request</Link></Button>
            </div>
        </div>
    );
};
