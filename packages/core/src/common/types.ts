import {AccountId, AssetId, AssetType} from "caip";
import {DIDResolutionResult, VerificationMethod} from "did-resolver";
import {Signer} from "did-jwt";

type Replace<T, U> = Omit<T, keyof U> & U
type Extensible<T> = T & { [x: string]: any }

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

export interface DIDAccount {
    did: string
    signer: (message: string | Uint8Array) => Promise<string>
    alg?: string
}

export interface BlockchainAccount {
    accountId: AccountId,
    signer: (message: string) => Promise<string>,
}

export type NftDidResolution = (NftDidResolved | NftDidPending);
export type DateType = string | Date

interface NftDidResolved {
    did: string,
    assetId: AssetId,
    status: AssetStatus.RESOLVED,
}

export type IssuerType = Extensible<{ id: string }> | string

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

    [x: string]: any
}

export interface CredentialStatus {
    id: string
    type: string
}

interface FixedCredentialPayload {
    '@context': string | string[]
    id?: string
    type: string | string[]
    issuer: IssuerType
    issuanceDate: DateType;
    expirationDate?: DateType;
    credentialSubject: Extensible<{
        id?: string
    }>
    credentialStatus?: CredentialStatus
    evidence?: any
    termsOfUse?: any
}

interface NarrowCredentialDefinitions {
    '@context': string[]
    type: string[]
    issuer: IssuerType,
    issuanceDate: string
    expirationDate?: string
}

interface NarrowPresentationDefinitions {
    '@context': string[]
    type: string[]
    verifier: string[]
    verifiableCredential?: Verifiable<W3CCredential>[]
}

export type W3CCredential = Extensible<Replace<FixedCredentialPayload, NarrowCredentialDefinitions>>
export type W3CPresentation = Extensible<Replace<FixedPresentationPayload, NarrowPresentationDefinitions>>
export type VerifiableCredential = JWT | Verifiable<W3CCredential>

export interface FixedPresentationPayload {
    '@context': string | string[]
    type: string | string[]
    id?: string
    verifiableCredential?: VerifiableCredential[]
    holder: string
    verifier?: string | string[]
    issuanceDate?: string
    expirationDate?: string
}

export type VerifiablePresentation = JWT | Verifiable<W3CPresentation>

// export interface VerifiablePresentation {
//     '@context': string | string[]
//     type: string | string[]
//     id?: string
//     verifiableCredential?: VerifiableCredential[]
//     holder: string
//     verifier?: string | string[]
//     issuanceDate?: string
//     expirationDate?: string
//
//     [x: string]: any
// }

export type JWT = string;

export interface Proof {
    type?: string

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any
}

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

export interface JWTPayload {
    iss?: string
    sub?: string
    aud?: string | string[]
    iat?: number
    nbf?: number
    exp?: number
    rexp?: number

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any
}

export type Verifiable<T> = Readonly<T> & { readonly proof: Proof }

export interface JWTVerifyPolicies {
    now?: number
    nbf?: boolean
    iat?: boolean
    exp?: boolean
    aud?: boolean
}

export type VerifiedJWT = JWTVerified

export type VerifiedPresentation = VerifiedJWT & {
    verifiablePresentation: Verifiable<W3CPresentation>
}

export interface JWTVerified {
    verified: boolean
    payload: Partial<JWTPayload>
    didResolutionResult: DIDResolutionResult
    issuer: string
    signer: VerificationMethod
    jwt: string
    policies?: JWTVerifyPolicies
}

export type JwtPresentationPayload = JWTPayload & {
    vp: Extensible<{
        '@context': string[] | string
        type: string[] | string
        verifiableCredential?: JWT[] | JWT
    }>
    nonce?: string
}

export type JwtVcnftPresentationPayload = JwtPresentationPayload & {
    sub: string,
    iss: string,
    ownershipProof: string
}
