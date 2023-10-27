import React, {useEffect} from "react";
import FerrariLogo from "@/app/manufacturer/logo";
import {apiInstance} from "@/utils/Axios";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {AiFillCaretLeft} from "react-icons/ai";
import {Link, Route, Routes} from "react-router-dom";
import Issue from "@/app/manufacturer/issue";
import {Input} from "@/components/ui/input";
import {CopyIcon} from "@radix-ui/react-icons";
import {cn} from "@/utils/utils";
import {toast} from "@/components/ui/use-toast";
import ManufacturerStatus from "@/app/manufacturer/status";
import {Skeleton} from "@/components/ui/skeleton";

export const ISSUER_NAME = "Ferrari"

const Manufacturer = () => {
  const [issuerDid, setIssuerDid] = React.useState<string | undefined>(undefined)
  const [loadingDid, setLoadingDid] = React.useState<boolean>(true)

  // const issuerDisplay = issuerDid ? issuerDid.slice(0, 15) + "..." + issuerDid.slice(-5, issuerDid.length) : "Click here to get a new DID"
  const issuerDisplay = issuerDid ? issuerDid : "Click here to get a new DID"

  useEffect(() => {
    apiInstance.get(`/issuer/${ISSUER_NAME}/did`)
      .then(r => setIssuerDid(r.data))
      .catch(err => undefined)
      .finally(() => setLoadingDid(false))
  }, [])

  function handleDidCreate() {
    setLoadingDid(true)
    apiInstance.put(`/issuer/${ISSUER_NAME}/did`)
      .then(r => setIssuerDid(r.data))
      .finally(() => setLoadingDid(false))
  }

  const didInputRef = React.useRef<HTMLInputElement>(null)
  function handleDidCopy() {
    didInputRef.current?.select();
    didInputRef.current?.setSelectionRange(0, 99999);

    if (issuerDid)
      navigator.clipboard.writeText(issuerDid);

    toast({
      title: "Copied DID to clipboard"
    })
  }

  return (
    <div>
      <div className={"h-[4rem] w-full bg-[#181818] flex items-center justify-center"}>
        <FerrariLogo className={"h-10 w-10 fill-white"}/>
      </div>

      <div className={"flex flex-col items-center justify-center py-4 gap-4"}>

          <Card className={cn("text-sm flex flex-col h-fit py-2 px-4 w-[380px] max-w-full box-border", (loadingDid || !!issuerDid) && "text-black/50")}>
            <span className={"flex items-center gap-1"}><b>Issuer:</b> {ISSUER_NAME}</span>
            <span className={"flex items-center gap-1"}>
              <b>DID:</b>
              {!loadingDid && <>
              {issuerDid ? <Input className={"max-w-[80%] truncate border-none h-2 px-1"} readOnly value={issuerDisplay} ref={didInputRef}/>
                : <Button variant={"secondary"} size={"sm"} onClick={handleDidCreate}>Click here to get a new DID</Button>
              }
              {!!issuerDid && <Button size={"icon"} variant={"ghost"} onClick={handleDidCopy}><CopyIcon /></Button>}</>}
              {loadingDid && <Skeleton className="w-[80%] h-[20px] rounded-full"/>}
            </span>
          </Card>

          <Routes>

            <Route path={"/"} element={<>
            <div className={"flex flex-wrap gap-5 items-center justify-center max-w-[420px]"}>
              <ActionCard
                title={"Issue Credential"}
                sub={"Issue a credential detailing the characteristics of a new car."}
                href={"/manufacturer/issue"}
              />

              <ActionCard
                title={"Credential Status"}
                sub={"View the status of all credentials issued by this manufacturer."}
                href={"/manufacturer/status"}
              />
            </div>
                <Button asChild variant={"ghost"} className={"min-w-[420px] flex flex-row align-center justify-center gap-2"}>
                    <Link to={"/"}>
                        <AiFillCaretLeft className={"w-5 h-5"}/> Back to Demo
                    </Link>
                </Button>
              </>} />

            <Route path={"issue"} element={<Issue/>}/>
            <Route path={"status/*"} element={<ManufacturerStatus />}/>
          </Routes>

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
    <Button
      className="max-w-[200px] flex flex-col tracking-wide leading-snug  w-fit h-fit aspect-square whitespace-pre-wrap"
      variant={"outline"} asChild>
      <Link to={href}>
      <h2 className={"font-bold"}>{title}</h2>
      <small>{sub}</small>
      </Link>
    </Button>
  )
}

export default Manufacturer;
