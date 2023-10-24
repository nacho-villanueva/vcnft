'use client'

import React from 'react';
import {Navbar, NavbarBrand, NavbarContent, NavbarItem} from "@nextui-org/react";
import {Link} from "@nextui-org/link";
import {Button} from "@nextui-org/button";

const TopNavbar = () => {
    return (
        <Navbar className={"bg-transparent"}>
            <NavbarBrand>
                <p className="font-bold text-inherit">VCNFT Car Registry</p>
            </NavbarBrand>
            {/*<NavbarContent className="hidden sm:flex gap-4" justify="center">*/}
            {/*    <NavbarItem>*/}
            {/*        <Link color="foreground" href="#">*/}
            {/*            Features*/}
            {/*        </Link>*/}
            {/*    </NavbarItem>*/}
            {/*    <NavbarItem isActive>*/}
            {/*        <Link href="#" aria-current="page">*/}
            {/*            Customers*/}
            {/*        </Link>*/}
            {/*    </NavbarItem>*/}
            {/*    <NavbarItem>*/}
            {/*        <Link color="foreground" href="#">*/}
            {/*            Integrations*/}
            {/*        </Link>*/}
            {/*    </NavbarItem>*/}
            {/*</NavbarContent>*/}
            <NavbarContent justify="end">
                {/*<NavbarItem className="hidden lg:flex">*/}
                {/*    <Link href="#">Login</Link>*/}
                {/*</NavbarItem>*/}
                <NavbarItem>
                    <Button as={Link} color="primary" href="/wallet" variant="flat">
                        Go to Wallet
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    )
};

export default TopNavbar;