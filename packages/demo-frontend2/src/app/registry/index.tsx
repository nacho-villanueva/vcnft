// @flow
import * as React from 'react';
import {useEffect} from 'react';
import {Button} from "@/components/ui/button";
import {Link, Route, Routes} from "react-router-dom";
import {AiFillCaretLeft} from "react-icons/ai";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ValidateIdentity} from "@/app/registry/register/validate";
import {IssueLicense} from "@/app/registry/register/issue";
import {cn} from "@/utils/utils";
import {Input} from "@/components/ui/input";
import {CopyIcon} from "@radix-ui/react-icons";
import {Skeleton} from "@/components/ui/skeleton";
import {apiInstance} from "@/utils/Axios";
import {toast} from "@/components/ui/use-toast";

export const REGISTRY_NAME = "DNRPA"

export const Registry = () => {
  const [issuerDid, setIssuerDid] = React.useState<string | undefined>(undefined)
  const [loadingDid, setLoadingDid] = React.useState<boolean>(true)

  function handleDidCreate() {
    setLoadingDid(true)
    apiInstance.put(`/issuer/${REGISTRY_NAME}/did`)
      .then(r => setIssuerDid(r.data))
      .finally(() => setLoadingDid(false))
  }
  const issuerDisplay = issuerDid ? issuerDid : "Click here to get a new DID"

  useEffect(() => {
    apiInstance.get(`/issuer/${REGISTRY_NAME}/did`)
      .then(r => setIssuerDid(r.data))
      .catch(err => undefined)
      .finally(() => setLoadingDid(false))
  }, [])

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
    <div className={"flex flex-col items-center"}>
      <nav className={"w-full h-[6rem] bg-[#37bbed] p-4 flex items-center justify-center gap-6 shadow"}>
        <img src={"/images/dnrpa.png"} className={"h-[1.5rem]"} alt={"policia"}/>
        <div className={"h-full w-[4px] rounded-2xl bg-white"}/>
        <h1 className={"font-semibold text-xl text-white"}>Motor Vehicle Registry Portal</h1>
      </nav>
      <div className={"w-full flex flex-start"}>
        <Button variant={'link'} asChild><Link to={"/"}><AiFillCaretLeft/>Back to
          demo</Link></Button>
      </div>

      <Card className={cn("text-sm flex flex-col h-fit py-2 px-4 w-[380px] max-w-full box-border mb-2", (loadingDid || !!issuerDid) && "text-black/50")}>
        <span className={"flex items-center gap-1"}><b>Issuer:</b> {REGISTRY_NAME}</span>
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

      <Card className={"max-w-[500px]"}>
        <CardHeader className={"pb-2"}>
          <CardTitle>
            Register A New Car
          </CardTitle>
          <CardDescription>
            Register a new car and receive a verifiable credential with the car's License Plate.
          </CardDescription>
        </CardHeader>
        <CardContent>
        <Routes>
          <Route path={"/"} element={<ValidateIdentity />}/>
          <Route path={"/verify/:id"} element={<ValidateIdentity />}/>
          <Route path={"/issue/:id"} element={<IssueLicense />}/>
        </Routes>

        </CardContent>
      </Card>

    </div>
  );
};
