import {apiInstance} from "@vcnft/demo-frontend/api/Axios"

export function issueNewCar() {
  return apiInstance.post("/issuer/new-car", {

  })
}
