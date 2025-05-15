import { Animator, Text } from "@arwes/react";
import { FrameNefrex } from '@arwes/react-frames'

export const Button = ({ text, url, submitted }) => {
    return (
        <Animator>
            <a className="button" href={url} onClick={() => {
                window.location.href = url;
            }}>
                <FrameNefrex />
                <Text as="span">{text}</Text>
            </a>
        </Animator>
    )
}