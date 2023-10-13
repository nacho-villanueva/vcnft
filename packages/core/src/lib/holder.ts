import {AccountId, AssetId} from "caip";

class Holder {
  private account: AccountId;
    constructor(account: AccountId, publicKey: string) {
      this.account = account;
    }
}
