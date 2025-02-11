import React from "react";

import cn from "classnames";

import styles from "./styles.module.scss";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    colorType: "success" | "danger" | "info" | "warning" | "custom";
}

const ActionButton: React.FC<Props> = ({
    colorType,
    className,
    children,
    ...rest
}) => {
    return (
        <button
            {...rest}
            className={cn(styles.button, styles[colorType], className)}
        >
            {children}
        </button>
    );
};

export default ActionButton;
