'use client'

import {Card, CardBody, CardHeader, Divider, Image, Navbar, NavbarBrand} from "@nextui-org/react";
import styles from "@vcnft/demo-frontend/app/home.module.css";
import React from "react";
import FerrariLogo from "@vcnft/demo-frontend/app/manufacturer/logo";
import {BsArrowLeft} from "react-icons/bs";

export default function Manufacturer() {
    return (
        <div>
          <div className={"h-[4rem] w-full bg-[#181818] flex items-center justify-center"}>
            <FerrariLogo className={"h-10 w-10 fill-white"}/>
          </div>

          <div className={"w-100 flex items-center justify-center py-4"}>
          <div className={"flex flex-wrap gap-5 items-center justify-center max-w-[420px]"}>
          <ActionCard
            title={"Issue Credential"}
            sub={"Issue a credential detailing the characteristics of a new car."}
            href={"/manufacturer/issue"}
          />

          <ActionCard
            title={"Credential Status"}
            sub={"View the status of all credentials issued by this manufacturer."}
            href={"/manufacturer/issue"}
          />

            <Card className={"min-w-[420px] bg-white/60"} as={"a"} href={"/"}>
              <CardBody className={'flex flex-row align-center justify-center gap-2'}>
                <BsArrowLeft className={"flex align-center justify-center"}/> Back to Home
              </CardBody>
            </Card>
          </div>
          </div>

        </div>
    )
}

interface ActionCardProps {
    title: string,
    sub: string,
    href: string
}

const ActionCard = ({title, sub, href}: ActionCardProps) => {
    return (
      <Card className="max-w-[200px] aspect-square">
        <CardBody>
          <h2>{title}</h2>
          <small>{sub}</small>
        </CardBody>
      </Card>
    )
}
