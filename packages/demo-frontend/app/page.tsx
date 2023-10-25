'use client'
import React, {ReactNode} from "react";
import {Card, CardHeader, Divider, Image} from "@nextui-org/react";
import styles from "./home.module.css"
export default function Main() {
    return (<div>

        <div className={"px-4"}>
        <h1 className={"text-large text-center font-extrabold"}>
          NFT Verifiable Credentials
        </h1>
        <p className={"text-center text-tiny text-white/60"}>
          VCNFT Thesis Demo
        </p>

        <hr className="" />
        </div>

      <div className={styles.cardList}>

        <CardItem
          href={"/wallet"}
        title={"Wallet"}
        sub={"Verifiable Credentials Wallet"}
        image={"/images/wallet.png"}
        />

        <CardItem
          href={"/manufacturer"}
        title={"Manufacturer"}
        sub={"Car Manufacturer Credential Issuer"}
        image={"/images/ferrari.jpg"}
        />

        <CardItem
          href={"/registry"}
        title={"Car Registry"}
        sub={"Car Registry Issuer"}
        image={"/images/registry.jpg"}
        />

        <CardItem
          href={"/verifier"}
        title={"Verifier"}
        sub={"Credentials Verifier"}
        image={"/images/verifier.jpg"}
        />

      </div>
      </div>
    )
}

type CardItemProps = {
  href: string,
  title: string,
  sub: string,
  image: string
}

const CardItem = ({title, sub, image, href}: CardItemProps) => {
  return <a className={styles.card} href={href}>
    <div className={styles.cardHeader}>
      <h4 className="text-white font-medium text-large">{title}</h4>
      <p className="text-tiny text-white/60">{sub}</p>
    </div>
    <div className={styles.cardBackdrop}/>
    <Image
      removeWrapper
      alt="Card background"
      className={styles.cardCover}
      src={image}
    />
  </a>
}
