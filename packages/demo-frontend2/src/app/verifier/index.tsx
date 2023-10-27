// @flow
import * as React from 'react';
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Link, Route, Routes} from "react-router-dom";
import {RequestVerification} from "@/app/verifier/request";
import {VerifyRequest} from "@/app/verifier/verify";
import {Button} from "@/components/ui/button";
import {AiFillCaretLeft} from "react-icons/ai";


export const Verifier = () => {
    return (
        <div className={"flex flex-col items-center gap-4"}>
            <nav className={"w-full h-[6rem] border-b-4 border-blue-500 p-4 flex items-center justify-center gap-6"}>
                <img src={"/images/policia.png"} className={"h-[4rem]"} alt={"policia"}/>
                <h1 className={"font-semibold text-xl"}>Car Verification Portal</h1>
            </nav>
            <div className={"w-full flex flex-start"}>
                <Button variant={'link'} asChild><Link to={"/"}><AiFillCaretLeft/>Back to
                    demo</Link></Button>
            </div>
            <Card className={"max-w-[500px]"}>
                <CardHeader>
                    <CardTitle>
                        Request Car Credentials
                    </CardTitle>
                    <CardDescription>
                        Verify a car's identity by requesting verifiable presentations of the car credentials.
                        Set the needed claims to verify.
                    </CardDescription>
                </CardHeader>

                <Routes>
                    <Route path={"/"} element={<RequestVerification/>}/>
                    <Route path={"/verify/:id"} element={<VerifyRequest/>}/>
                </Routes>

            </Card>
        </div>
    );
};
