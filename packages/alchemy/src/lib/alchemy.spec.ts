import { getTransfer } from './alchemy';

describe('alchemy', () => {
  it('should work', async () => {
    await getTransfer()
  }, 50_000);
});
