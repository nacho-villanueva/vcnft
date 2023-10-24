import { useEffect, useState } from 'react';

const useWebSocket = (url: string, onMessage: (base64code: string) => void): string | null => {
    const [socketStatus, setSocketStatus] = useState<string | null>(null);

    useEffect(() => {
        let socket: WebSocket;

        function handleOpen(): void {
            setSocketStatus('OPEN');
        }

        function handleClose(): void {
            setSocketStatus('CLOSED');
        }

        function handleMessage(event: MessageEvent): void {
            const { data } = event;

            if (data) {
                const message = JSON.parse(data);

                if (message.base64) {
                    onMessage(message.base64);
                }
            }
        }

        if (!window.WebSocket) {
            console.log('Your browser does not support WebSockets');
            return;
        }

        socket = new WebSocket(url);
        socket.onopen = handleOpen;
        socket.onclose = handleClose;
        socket.onmessage = handleMessage;

        return () => {
            socket.close();
        };
    }, [url, onMessage]);

    return socketStatus;
};

export default useWebSocket;