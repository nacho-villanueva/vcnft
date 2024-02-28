import styles from "./home.module.css";
import * as React from 'react';
import {Image} from "@nextui-org/react";
import {Link} from "react-router-dom";

const Home = () => {
    return (
        <div className={styles.mainContainer}>
            <div className={"px-4"}>
                <h1 className={"text-large text-white text-center font-extrabold"}>
                    NFT Verifiable Credentials
                </h1>
                <p className={"text-center text-tiny text-white/60"}>
                    VCNFT Thesis Demo
                </p>

                <hr className="" />
            </div>

            <div className={styles.cardList}>

              <div className={styles.disclaimer}>
                IMPORTANT: Currently only Sepolia testnet is supported. Please switch your wallet to Sepolia testnet.
              </div>

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
    );
};

export default Home;


type CardItemProps = {
    href: string,
    title: string,
    sub: string,
    image: string
}

const CardItem = ({title, sub, image, href}: CardItemProps) => {
    return <Link className={styles.card} to={href}>
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
    </Link>
}

