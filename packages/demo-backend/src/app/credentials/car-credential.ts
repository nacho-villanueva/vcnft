import { Credential } from './credential';
export class CarCredential extends Credential {
  private readonly model: string;
  private readonly color: string;
  private readonly vin: string;



    constructor(model: string, color: string, vin: string, subjectDid: string) {
      super(subjectDid, 'CarCredential');
      this.model = model;
      this.color = color;
      this.vin = vin;
    }

    generateCredential(): Record<string, any> {
      return {
        type: ["VerifiableCredential", this.type],
        credentialSubject: {
          id: this.subjectDid,
          model: this.model,
          color: this.color,
          vin: this.vin
        }
      };
    }
}
