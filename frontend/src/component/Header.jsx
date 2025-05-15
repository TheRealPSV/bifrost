import { useState, useEffect } from "react";

export const Header = ({ submitted, titleText }) => {
    return (
        <div className="logocontainer">
            <span className="logo">{titleText}</span>
        </div>
    )
}