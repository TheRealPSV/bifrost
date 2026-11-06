import { useState, useEffect } from "react";

export const Header = ({ submitted, logoText }) => {
    return (
        <div className="logocontainer">
            <span className="logo">{logoText}</span>
        </div>
    )
}