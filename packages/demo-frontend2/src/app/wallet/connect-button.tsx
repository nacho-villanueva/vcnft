import {Button} from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {useWeb3ModalAccount, useWeb3ModalEvents} from '@web3modal/ethers/react'

const ConnectWalletButton = ({onConnect, connecting}: { onConnect: () => void, connecting: boolean}) => {
    const eth = typeof window !== 'undefined' ? (window as any).ethereum : undefined;

    return (<div className={"flex flex-col items-center w-full"}>
            <w3m-connect-button />

            {!eth && (
                <div className={"text-center"}>
                    <p className={"text-red-500"}>Uh oh. Seems like you don't have an Ethereum wallet installed.</p>
                    <p className={"text-red-500"}>Please install one to continue</p>
                </div>
            )}
        </div>
    )
}

export default ConnectWalletButton;
