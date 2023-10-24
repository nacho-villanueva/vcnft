import {Credential, JWT, JWTWithPayload, SSIProvider} from "@vcnft/core";
import axios, {Axios} from "axios";


export enum KeyType {
  ED25519   = "Ed25519",
  X25519    = "X25519",
  SECP256K1 = "secp256k1",
  SECP256K1_ECDSA =  "secp256k1-ECDSA",
  P_224     = "P-224",
  P_256     = "P-256",
  P_384     = "P-384",
  P_521     = "P-521",
  RSA       = "RSA",
  BLS12381G1= "BLS12381G1",
  BLS12381G2= "BLS12381G2",
  DILITHIUM2= "Dilithium2",
  DILITHIUM3= "Dilithium3",
  DILITHIUM5= "Dilithium5"
}

export class TBDSSIProvider implements SSIProvider {

  private axios: Axios;

  constructor(apiEndpoint: string) {
    this.axios = axios.create({
      baseURL: apiEndpoint,
    })

  }

  async health(): Promise<string> {
    try {
      return this.axios.get('/health')
        .then(res => res.data["status"])
        .catch(err => {
          return "Error:" + err;
        });
    }
    catch (e) {
      return "Connection refused: " + axios.defaults.baseURL;
    }
  }

  async getDids(method: "key"|"web"|"ion"): Promise<Array<Record<any, any>>> {
    return this.axios.get('/v1/dids/'+method)
      .then(res => res.data["dids"] ?? [])
      .catch(err => {console.error(err.response?.data); return null});
  }

  async getDidDocument(method: "key"|"web"|"ion", did: string): Promise<Record<any, any>> {
    return this.axios.get('/v1/dids/'+method+'/'+did)
      .then(res => res.data["did"])
      .catch(err => {console.error(err.response?.data); return null});
  }

  async resolveDid(did: string): Promise<Record<any, any>> {
    return this.axios.get('/v1/dids/resolver/'+ did)
        .then(res => res.data["didDocument"])
        .catch(err => {console.error(err.response?.data); return null});
  }

  async generateDid(method: "key"|"web"|"ion", keyType: KeyType=KeyType.ED25519): Promise<Record<any, any>> {
    return this.axios.put('/v1/dids/'+method, {
      keyType: keyType
    }).then(res => res.data["did"])
      .catch(err => {console.error(err.response?.data); return null});
  }

  async signCredential(credential: Credential, verificationMethodId?: string): Promise<JWTWithPayload<Credential>> {
    const data = Object.fromEntries(
      Object.entries(credential.credentialSubject)
        .filter(([key, value]) => key !== "id"))

    const signed = await this.axios.put('/v1/credentials', {
      // "@context": credential["@context"] ?? null,
      data: data,
      issuer: credential.issuer,
      subject: credential.credentialSubject.id,
      verificationMethodId: verificationMethodId ?? credential.issuer,
      expiry: credential["expirationDate"] ?? null,
    }).then(res => res.data)
      .catch(err => {console.error(err.response?.data); return null});

    return {
      payload: signed["credential"],
      jwt: signed["credentialJwt"],
    }
  }

  async verifyCredential(credential: JWTWithPayload<Credential>): Promise<boolean> {
    return this.axios.put('/v1/credentials/verification', {
      credentialJwt: credential.jwt,
    }).then(res => res.data["verified"])
      .catch(err => {console.error(err.response?.data); return null});
  }

  async verifyPresentation(JWTWithPayload: JWT): Promise<boolean> {
    return this.axios.put('/v1/presentations/verification', {
      presentationJwt: JWTWithPayload,
    }).then(res => res.data["verified"])
      .catch(err => {console.error(err.response?.data); return null});
  }

}
