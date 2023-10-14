import {AccountId, AssetId} from "caip";

export class Holder {
  private account: AccountId;
    constructor(account: AccountId, publicKey: string) {
      this.account = account;
    }
}
