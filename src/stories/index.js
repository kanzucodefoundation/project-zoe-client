import React from "react";
import CSS from "./Button.module.css";

function Button({ text, color = "##FFFF00" }) {
    return (
        <button style={{ backgroundColor: color }} className={CSS.button}>
            {text}
        </button>
    );
}
//I have passed in props for text and color (with a default value)

export default Button;