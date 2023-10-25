import {apiInstance} from "@/utils/Axios"

export function issueNewCar() {
  return apiInstance.post("/issuer/new-car", {

  })
}

export function getDid(name:string) {
  return apiInstance.get(`/issuer/${name}/did`)
}
