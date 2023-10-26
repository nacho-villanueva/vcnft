import {
    BlockchainAccount,
    DIDAccount,
    JwtVcnftPresentationPayload,
    JWTWithPayload,
    W3CCredential
} from "../common/types";
import {generateOwnershipProofMessage} from "./utils";
import {createVerifiablePresentationJwt} from "did-jwt-vc";

export class Holder {
    private blockchainAccount: BlockchainAccount;
    private didAccount: DIDAccount;

    constructor(blockchainAccountId: BlockchainAccount, didAccount: DIDAccount) {
        this.blockchainAccount = blockchainAccountId;
        this.didAccount = didAccount;
    }

    async generatePresentationPayload(credentials: JWTWithPayload<W3CCredential>[]) {
        if (credentials.length === 0) throw new Error("No credentials provided")
        const subjects = credentials
            .map(c => c.payload.credentialSubject.id)
            .filter(c=> c !== undefined )

        if (subjects.length === 0) throw new Error("No credential subjects provided")

        const subject = subjects[0]!
        const issuer = this.didAccount.did;

        let payloadCredentials = []
        for (let credential of credentials) {
            if (credential.payload.credentialSubject.id !== subject) console.warn("Credentials have multiple subject. Discarding credentials with subject: " + credential.payload.credentialSubject.id)
            else payloadCredentials.push(credential.jwt)
        }

        const ownershipProof = generateOwnershipProofMessage(issuer, subject)
        const signedOwnershipProof = await this.blockchainAccount.signer(ownershipProof)

        return {
            sub: subject,
            iss: this.didAccount.did,
            ownershipProof: signedOwnershipProof,
            vp: {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiablePresentation', "VCNFTPresentation"],
                verifiableCredential: payloadCredentials
            },
        } as JwtVcnftPresentationPayload;
    }

    async signPresentation(payload: JwtVcnftPresentationPayload) {
        return await createVerifiablePresentationJwt(payload, this.didAccount)
    }
}
