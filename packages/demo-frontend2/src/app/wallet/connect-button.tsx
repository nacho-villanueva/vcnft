import {Button} from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const ConnectWalletButton = ({onConnect, connecting}: { onConnect: () => void, connecting: boolean}) => {
    const eth = typeof window !== 'undefined' ? (window as any).ethereum : undefined;
    return (<div className={"flex flex-col items-center w-full"}>
            <Button variant={"ghost"}
                    className={"bg-orange-500/30 hover:bg-orange-500/90 hover:text-white/95 font-semibold w-1/2"}
                    onClick={onConnect} disabled={!eth || connecting}>
                {!connecting ? "Connect Metamask" : <><LoadingSpinner /> Connecting...</>}
            </Button>
            {!eth && (
                <div className={"text-center"}>
                    <p className={"text-red-500"}>Uh oh. Seems like you don't have Metamask.</p>
                    <p className={"text-red-500"}>Please install Metamask to continue</p>
                </div>
            )}
        </div>
    )
}

export default ConnectWalletButton;
