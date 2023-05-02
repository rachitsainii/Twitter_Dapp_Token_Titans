import React from "react";
import "./Rightbar.css"
import hardhat from '../images/HardhatLogo.jpg';
import solidity from '../images/SolidityLogo.png';
import metamask from '../images/MetaMaskLogo.png';
import ethereum from '../images/EthereumLogo.jpg';
import {Input} from '@web3uikit/core';
import { Search } from '@web3uikit/icons';


const Rightbar = () =>{
    const trends = [
        {
            img:hardhat,
            text: "Learn how to use hardhat dev tool",
            link: "#",
        },
        {
            img:solidity,
            text: "Master Smart Contract development",
            link: "#",
        },
        {
            img:ethereum,
            text: "Learn all about ethereum",
            link: "#",
        },
        {
            img:metamask,
            text: "Become a web3 developer",
            link: "#",
        },
    ]
    return (
    <>
    <div className="rightbarContent">
        <Input label="Search Twitter" name='Search Twitter' prefixIcon={<Search/>} labelBgColor="#141d26"></Input>
        <div className="trends">
            Trending
            {
                trends.map((e)=>{
                    return (
                        <>
                        <div className="trend" onClick={()=>window.open(e.link)}>
                            <img src={e.img} className="trendImg"></img>
                            <div className="trendText">{e.text}</div>
                        </div>
                        </>
                    );
                })

            }
        </div>
    </div>
    </>
    );
}

export default Rightbar;