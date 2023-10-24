'use client'
import {io} from "socket.io-client";
import {useEffect, useState} from "react";
import QR from "../../components/QR";

export default function Home() {
    const [sessionId, setSessionId] = useState<string>('')

    useEffect(() => {
        const socket = io('http://localhost:3000');
        socket.on('connect', function () {
            console.log('Connected');

            // socket.emit('events', {test: 'test'});
            // socket.emit('identity', 0, (response: string) => {
            //         console.log('Identity:', response)
            //         setRes(prev => [...prev, "identity: " + response])
            //     }
            // );
        });
        socket.on('session', function (data) {
            console.log('Session ID set:', data);
            setSessionId(data)
        });
        socket.on('exception', function (data) {
            console.log('event', data);
        });
        socket.on('disconnect', function () {
            console.log('Disconnected');
        });

        return () => {
            socket.disconnect()
        }
    }, [])


    return (
        <div>
            <QR data={sessionId}/>
        </div>
    )
}
