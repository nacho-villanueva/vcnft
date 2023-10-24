'use client'

import {PropsWithChildren} from "react";
import {NextUIProvider} from "@nextui-org/react";
import {DIDContextProvider} from "@vcnft/demo-frontend/hooks/UseDID";
import {CredentialCard} from "@vcnft/demo-frontend/components/credential-card/credential-card";

const MainProviders = ({children}: PropsWithChildren<{}>) => {
    return (
        <NextUIProvider>
            <DIDContextProvider>
                {children}
              <CredentialCard></CredentialCard>
            </DIDContextProvider>
        </NextUIProvider>
    )
}

export default MainProviders;
