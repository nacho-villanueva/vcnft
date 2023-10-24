
export class Credential {
  protected subjectDid: string;
  protected type: string;

  constructor(subjectDid: string, type: string) {
    this.subjectDid = subjectDid;
    this.type = type;
  }

  generateCredential(): Record<string, any> {
    return {
      type: ["VerifiableCredential", this.type],
      credentialSubject: {
        id: this.subjectDid,
      }
    };
  }
}
