import React from 'react';
import {useEffect, useState} from "react";
import {IMAGE_PATHS} from '../constants/gameConstants';

/**
 * ShifuDisplay Component - Displays Shifu opponent with speech bubble
 * @param {object} comment - Current comment to display
 */

const ShifuDisplay = ({ comment }) => {
    const [key, setKey] = useState(0);

    useEffect(() => {
        if (comment) {
            setKey(prev => prev + 1);
        }
    }, [comment]);

    return (
        <div className="shifu-container">
            <img
                className="shifu-img"
                src={IMAGE_PATHS.SHIFU}
                alt="Shifu Opponent"
            />
            <p className="shifu-label">Shifu Opponent</p>

            {comment && (
                <div key={key} className="shifu-speech-bubble visible">
                    <p className="shifu-comment">
                        {comment.emoji} {comment.text}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ShifuDisplay;
