// @flow
import * as React from 'react';
import QRCode from "react-qr-code";
import {Button} from "@/components/ui/button";
import {apiInstance} from "@/utils/Axios";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {toast} from "@/components/ui/use-toast";
import {useEffect} from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {cn, generateRandomLicensePlate, truncateDid} from "@/utils/utils";
import {ISSUER_NAME} from "@/app/manufacturer";
import {REGISTRY_NAME} from "@/app/registry";
import {JWTWithPayload, W3CCredential} from "@vcnft/core";
import moment from "moment";

export const IssueLicense = () => {
  const navigate = useNavigate()
  const {state} = useLocation()


  const {id} = useParams();
  const [loading, setLoading] = React.useState(false);
  const [request, setRequest] = React.useState<any>(null);
  const [credential, setCredential] = React.useState<JWTWithPayload<W3CCredential> | undefined>(undefined)

  const newLicensePlate = request?.subject ? generateRandomLicensePlate(request.subject) : ""

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

  useEffect(() => {
    if (!state) getRequest()
    else setRequest(state.request)

    console.log(state)
  }, [id]);


  const handleSend = (credential: JWTWithPayload<W3CCredential>) => {
    const addr = request.holderAccount.split(":")[2]

    apiInstance.put("/holder/credential/transfer/" + addr, {
      credentials: [JSON.stringify(credential)]
    }).then(r => {
      toast({
        title: "Credential Sent",
        description: "The credential has been sent to your wallet."
      })
    })
  }

  const handleResend = () => {
    if (!credential) return
    handleSend(credential)
  }

  const handleExport = () => {
    if (!credential) return
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(credential)], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "credential.jwt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    element.remove();
  }

  const handleConfirm = () => {
    apiInstance.post(`/issuer/${REGISTRY_NAME}/issue/vcnft`, {
      subject: request.subject,
      claims: {
        licensePlate: newLicensePlate,
      }
    }).then(r => {
      setCredential(r.data)
      handleSend(r.data)

      // navigate("/manufacturer/status/" + r.data._id)
    }).catch(err => {
      toast({
        title: "Error Issuing Credential",
        variant: "destructive",
        description: err.response?.data?.message || "Something went wrong",
      })
    })
  }

  const hasAllClaims = request?.claims?.make && request?.claims?.model && request?.claims?.year && request?.claims?.vin
  const validCredential = request?.verified

  const DisplayCredential = ({credential}: {credential: JWTWithPayload<W3CCredential>}) => {
    return (
      <div className={"flex flex-col gap-2"}>

        <h3 className={"font-bold text-green-500"}>
          Vehicle Registered
        </h3>
        <small>
          You have successfully registered a new vehicle. You can now use this credential to prove the vehicle's identity.
        </small>

        <div>
          <b>Vehicle DID: </b>
          <span>{truncateDid(credential.payload.credentialSubject.id)}</span>
        </div>

        <div>
          <b>License Plate: </b>
          <span>{credential.payload.credentialSubject.licensePlate}</span>
        </div>

        <div>
          <b>Issuer: </b>
          <span>{truncateDid(credential.payload.issuer.toString())} ({ISSUER_NAME})</span>
        </div>

        <div>
          <b>Issued At: </b>
          <span>
            {moment(credential.payload.issuanceDate).format("MMM. DD, YYYY HH:mm[hs]")}
          </span>
        </div>

          <small className={"text-gray-500 leading-tight"}>
            The credential will appear automatically in your wallet. If you don't see it, you can resend it to your wallet or export it manually.
          </small>

        <div className={"flex justify-end"}>
          <Button variant={"ghost"} onClick={handleExport}>Export Credential</Button>
          <Button variant={"ghost"} onClick={handleResend}>Resend to Wallet</Button>
        </div>

      </div>
    )
  }


  return (
    <div>
      {!credential && <><div className={"flex gap-2 items-center"}>
        <h3 className={"underline"}>Step 2</h3>
        <small>Verify the vehicle's information.</small>
      </div>
      <br/></>}

      {
        !!request && !hasAllClaims && (
          <div className={"text-red-500 bg-red-50 p-3 rounded mb-2"}>
            <b>Missing Credentials: </b>
            In order to register the vehicle you need to have all necessary credentials. Make sure you have the
              valid credentials which claim the Make, Model, Year and VIN of the vehicle.
          </div>
        )
      }

      {
        !!request && !validCredential && (
          <div className={"text-red-500 bg-red-50 p-3 rounded mb-2"}>
            <b>Invalid Credentials: </b>
            The credentials you provided are invalid. Please make sure you have the correct credentials and you are the owner these credentials.
          </div>
        )
      }

      {!!request && !credential && <>
        <div>
          <b>Verification: </b>
          <span className={cn(validCredential ? "text-green-500" : "text-red-500")}>
            {validCredential ? "Passed" : "Invalid"}
          </span>
        </div>

        <div>
          <b>Vehicle DID: </b>
          <span>{truncateDid(request.subject)}</span>
        </div>

        <div>
          <b>Make: </b>
          <span className={cn("capitalize", !request.claims.make && "text-red-500")}>
          {request.claims.make ?? "Missing"}
        </span>
        </div>

        <div>
          <b>Model: </b>
          <span className={cn("capitalize", !request.claims.model && "text-red-500")}>
          {request.claims.model ?? "Missing"}
        </span>
        </div>

        <div>
          <b>Year: </b>
          <span className={cn("capitalize", !request.claims.year && "text-red-500")}>
          {request.claims.year ?? "Missing"}
        </span>
        </div>

        <div>
          <b>VIN: </b>
          <span className={cn("capitalize", !request.claims.vin && "text-red-500")}>
          {request.claims.vin ?? "Missing"}
        </span>
        </div>

        {hasAllClaims && (<div>
          <b>New License Plate: </b>
          <span>{newLicensePlate}</span>
        </div>)}

      </>}

      <div className={"flex justify-end"}>
        {hasAllClaims && validCredential && !credential &&
          <>
        <Button variant={"ghost"} onClick={() => navigate("/registry")}>Cancel</Button>
        <Button onClick={handleConfirm}>Confirm</Button>
          </>
        }

        {
          (!hasAllClaims || !validCredential) && (
            <Button onClick={() => navigate("/registry")}>Restart</Button>
          )
        }

        {
          !!credential && (
            <DisplayCredential credential={credential} />
          )
        }
      </div>
    </div>)
}

