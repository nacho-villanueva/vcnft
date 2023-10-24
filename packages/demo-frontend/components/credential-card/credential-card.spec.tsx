import { render } from '@testing-library/react';

import CredentialCard from './credential-card';

describe('CredentialCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CredentialCard />);
    expect(baseElement).toBeTruthy();
  });
});
