import { useState, useEffect } from "react";
import { Animator, Text, GridLines } from "@arwes/react";

export const Background = ({ submitted }) => {
    return (
        <div className="background">
            <Animator active={true} duration={{ enter: 2, exit: 2 }}>
                <GridLines
                    lineColor={getComputedStyle(document.documentElement)
                        .getPropertyValue('--bg-grid-color')}
                    horizontalLineDash={[1, 3]}
                    verticalLineDash={[1, 3]}
                    distance={100} />
            </Animator>
        </div>
    )
}