import {BlockchainProvider, generateOwnershipProofMessage, SSIProvider, VerifiedPresentation} from "@vcnft/core";
import {Resolver} from "did-resolver";
import {verifyPresentation} from "did-jwt-vc";
import {getResolver, parseNftDid} from "../nft-did-resolver/resolver";
import {AccountId} from "caip";

interface VerificationMetadata {
    verified: boolean
    message: string
}

interface VerificationResult {
    verified: boolean
    verifiedPresentation: VerifiedPresentation | null
    metadata: VerificationMetadata[]
}

export class Verifier {
    private bp: BlockchainProvider;
    private ssi: SSIProvider;

    constructor(bp: BlockchainProvider, ssi: SSIProvider) {
        this.bp = bp;
        this.ssi = ssi;
    }

    async verifyNftDidOwnership(did: string, owner: AccountId, ownershipProof: string) {
        const resolver = getResolver({blockchainProvider: this.bp});
        const result = await new Resolver(resolver).resolve(did);

        if (result.didResolutionMetadata.error) {
            return {
                verified: false,
                metadata: {
                    error: result.didResolutionMetadata.error,
                },
                did: did,
            }
        }
        if (!result.didDocument)
            return {
                verified: false,
                metadata: {error: "No did document"},
                did: did
            }


        const isOwner = result.didDocument.verificationMethod?.some((vm) => vm.blockchainAccountId === owner.toString());

        let error = ""
        if (!isOwner) error = "Signer address not found in did document"

        return {
            verified: isOwner,
            metadata: {error: error},
            did: did,
        }
    }

    async verifyVcnftPresentationOwnership(iss: string, sub: string, ownershipProof: string) {
        const message = generateOwnershipProofMessage(iss, sub)
        const signer = this.bp.getAddressFromSignature(message, ownershipProof)

        const parsedDid = parseNftDid(sub)
        const accountId = new AccountId({chainId: parsedDid.chainId, address: signer})

        return await this.verifyNftDidOwnership(sub, accountId, ownershipProof)
    }

    async verifyVcnftPresentationJwt(presentationJwt: string, resolver: Resolver) : Promise<VerificationResult> {

        console.log(presentationJwt)
        let verifiedPresentation: VerifiedPresentation | null = await verifyPresentation(presentationJwt, resolver)
            .catch((e) => {
                return null})

        if (!verifiedPresentation || !verifiedPresentation.verified)
            return {
                verified: false,
                verifiedPresentation: null,
                metadata: [{
                    verified: false,
                    message: "Invalid Presentation. Either the Presentation is invalid or the signature isn't valid.",
                }],
            }

        let verified: boolean = verifiedPresentation.verified

        let verificationMetadata: {
            verified: boolean,
            message: string,
        }[] = []

        if (!verifiedPresentation.payload.sub
            || !verifiedPresentation.payload.iss
            || !verifiedPresentation.payload["ownershipProof"])
            return {
                verified: false,
                verifiedPresentation: verifiedPresentation,
                metadata: [{
                    verified: false,
                    message: "Subject (sub), Issuer (iss) and Ownership Proof (ownershipProof) are required in JWT Payload",
                }]
            }

        const ownershipVerified = await this.verifyVcnftPresentationOwnership(verifiedPresentation.payload.iss, verifiedPresentation.payload.sub, verifiedPresentation.payload["ownershipProof"])

        if (!ownershipVerified.verified)
            return {
                verified: false,
                verifiedPresentation: verifiedPresentation,
                metadata: [{
                    verified: false,
                    message: "Ownership verification failed: " + ownershipVerified.metadata.error,
                }]
            }

        if (verifiedPresentation.verified && verifiedPresentation.verifiablePresentation.verifiableCredential) {
            for (let vc of verifiedPresentation.verifiablePresentation.verifiableCredential) {
                if (vc.proof.type !== "JwtProof2020") throw new Error("Only JwtProof2020 is supported.")
                const vcVerification = await this.ssi.verifyCredentialJWT(vc.proof["jwt"])

                if (!vcVerification) {
                    verified = false
                    verificationMetadata.push({
                        verified: false,
                        message: "Failed to verify VC Signature",
                    })
                    break;
                }

                if (vc.credentialSubject.id !== verifiedPresentation.payload.sub) {
                    verified = false
                    verificationMetadata.push({
                        verified: false,
                        message: "VC Subject does not match Presentation Subject",
                    })
                    break;
                }
            }
        }

        return {
            verified: verified,
            verifiedPresentation: verifiedPresentation,
            metadata: verificationMetadata,
        }
    }

}
