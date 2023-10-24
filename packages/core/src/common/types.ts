import {AssetId, AssetType} from "caip";

export enum AssetStatus {
  RESOLVED = "RESOLVED",
  PENDING = "PENDING"
}

export type ResolvedAsset = {
  assetIds?: AssetId[],
  status: AssetStatus,
  txHash: string
}

export interface NftDidCreation {
  assetType: AssetType,
  txHash: string,
}

export type NftDidResolution = (NftDidResolved | NftDidPending);

interface NftDidResolved {
  did: string,
  assetId: AssetId,
  status: AssetStatus.RESOLVED,
}

interface NftDidPending {
  assetType: AssetType,
  txHash: string,
  status: AssetStatus.PENDING,
}

export interface Credential {
  "@context": any;
  type: string[] | string,
  issuer: string,
  issuanceDate: string,
  credentialSubject: {
    id: string,
    [x: string]: any
  }
  [x: string] : any
}

export interface VerifiableCredential extends Credential {
  proof?: any
}

export interface VerifiablePresentation {
  "@context": any;
  type: string[] | string,
  holder?: string;
  verifiableCredential?: any;
  proof?: any;
  [x: string] : any
}

export type JWT = string;

export interface JWTWithPayload<P> {
  payload: P;
  jwt: JWT;
}

export interface Key {
  id: string;
  type: string;
  controller: string;
  signer?: () => any;
  verifier?: () => any;
  useJwa?: (options: any) => any;
}

export interface Suite {
  key?: Key;
  getVerificationMethod: (options: any) => Promise<Key>;
  deriveProof?: (options: any) => Promise<any>;
}
