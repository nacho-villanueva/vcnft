import {createContext, useContext, useEffect, useState} from "react";
import {DID} from "@vcnft/demo-frontend/types/DID";

interface DIDContext {
    dids: DID[];
    addDID: (did: DID) => void;
}

const DIDContext = createContext<DIDContext>({
    dids: [] as DID[],
    addDID: (did: DID) => {}
});

export const DIDContextProvider = ({children}: { children: React.ReactNode }) => {
    const [dids, setDIDs] = useState<DID[]>([]);

    useEffect(() => {
        const dids = localStorage.getItem("dids");
        if (dids) {
            setDIDs(JSON.parse(dids));
        }
    }, []);

    function addDID(did: DID) {
        setDIDs((prev: DID[]) => {
            const newDIDs = [...prev, did];
            localStorage.setItem("dids", JSON.stringify(newDIDs));
            return newDIDs;
        });
    }

    const value: DIDContext = {
        dids,
        addDID
    }

    return <DIDContext.Provider value={value}>
        {children}
    </DIDContext.Provider>;
}

export const useDID = () => useContext(DIDContext);
