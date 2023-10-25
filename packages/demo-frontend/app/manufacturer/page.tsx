'use client'

import {Button, Card, CardBody} from "@nextui-org/react";
import React, {useEffect} from "react";
import FerrariLogo from "@/app/manufacturer/logo";
import {BsArrowLeft} from "react-icons/bs";
import {apiInstance} from "@/utils/Axios";

const issuerName = "Ferrari"

const Manufacturer = ( ) {
    const [issuerDid, setIssuerDid] = React.useState<string | undefined>(undefined)

    useEffect(() => {
        apiInstance.get(`/issuer/${issuerName}/did`)
        .then(r => setIssuerDid(r.data))
        .catch(err => undefined)
    }, [])

    function handleDidCreate() {
        alert("asd")
        // apiInstance.put(`/issuer/${issuerName}/did`)
        //     .then(r => setIssuerDid(r.data))
    }

    return (
        <div>
            <div className={"h-[4rem] w-full bg-[#181818] flex items-center justify-center"}>
                <FerrariLogo className={"h-10 w-10 fill-white"}/>
            </div>

            <div className={"w-100 flex items-center justify-center py-4"}>
                <div className={"flex flex-wrap gap-5 items-center justify-center max-w-[420px]"}>
                    <button className={"min-w-[420px]"} variant={"solid"} onClick={handleDidCreate}>
                        <span><b>Issuer:</b> {issuerName}</span><br/>
                        <span><b>DID:</b> {issuerDid ?? "Click here to get a new DID"}</span>
                    </button>

                    <ActionCard
                        title={"Issue Credential"}
                        sub={"Issue a credential detailing the characteristics of a new car."}
                        href={"/manufacturer/issue"}
                    />

                    <ActionCard
                        title={"Credential Status"}
                        sub={"View the status of all credentials issued by this manufacturer."}
                        href={"/manufacturer/issue"}
                    />

                    <Card className={"min-w-[420px] bg-white/60"} as={"a"} href={"/"}>
                        <CardBody className={'flex flex-row align-center justify-center gap-2'}>
                            <BsArrowLeft className={"flex align-center justify-center"}/> Back to Home
                        </CardBody>
                    </Card>
                </div>
            </div>

        </div>
    )
}

interface ActionCardProps {
    title: string,
    sub: string,
    href: string
}

const ActionCard = ({title, sub, href}: ActionCardProps) => {
    return (
        <Card className="max-w-[200px] aspect-square">
            <CardBody>
                <h2>{title}</h2>
                <small>{sub}</small>
            </CardBody>
        </Card>
    )
}
