// @flow
import * as React from 'react';
import QRCode from "react-qr-code";
import {Button} from "@/components/ui/button";
import {apiInstance} from "@/utils/Axios";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "@/components/ui/use-toast";
import {useEffect} from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export const ValidateIdentity = () => {
  const navigate = useNavigate()

  const {id} = useParams();
  const [loading, setLoading] = React.useState(true);
  const [request, setRequest] = React.useState<any>(null);

  const url = `${import.meta.env.VITE_BASE_URL}/wallet/verify/${id}`

  function getRequest() {
    setLoading(true)
    apiInstance.get(`/verifier/verify/${id}`)
      .then(r => {
        if (r.data.status !== "PENDING") {
          navigate(`/registry/issue/${id}`, {
            state: {
              request: r.data
            }
          })
        }

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
    if (id) getRequest()
    else setLoading(false)
  }, [id]);


  const handleGetQR = () => {
    apiInstance.put("/verifier/verify", {
      claims: ["make", "model", "year", "vin"]
    }).then(r => {
      navigate(`/registry/verify/${r.data}`)
    })
  }

  return (
    <div>
      <h3 className={"underline"}>Step 1</h3>
      <div className={"mb-2"}>
        <p>Validate the vehicle's identity by scanning the QR.</p>
        <small>Make sure to have the valid credentials, which must:
          <ul className={"list-disc list-inside"}>
            <li>Be issued by a registered manufacturer</li>
            <li>Contain the vehicle's <b>Make</b>, <b>Model</b>, <b>Year</b> and <b>VIN</b></li>
            <li>You must be the owner of these credential's</li>
          </ul>
        </small>
      </div>


      {!request && !loading && <Button onClick={handleGetQR} className={"w-full"}>Get QR</Button>}
      {loading && <div className={"w-full flex items-center justify-center min-h-[200px]"}><LoadingSpinner size={12}
                                                                                                           color={"text-[#37bbed]"}/>
      </div>}
      {!loading && request && request.status === "PENDING" && (
        <div className={"flex flex-col items-center gap-4"}>
          <QRCode
            style={{height: "auto", maxWidth: "100%", width: "75%"}}
            value={url}
          />
          <p>Refresh once you've scanned the QR with vehicle's identity.</p>
          <Button className={"w-full"} onClick={getRequest} variant={"secondary"}>Refresh</Button>
        </div>
      )}
    </div>
  );
};
