import React from "react";

const clsx = (...classes) => classes.filter(Boolean).join(' ');

const sizes = [
    { tiny: "px-2 h-6 text-xs", small: "px-3 h-8 text-sm", medium: "px-4 h-10 text-sm", large: "px-6 h-12 text-base" },
    { tiny: "w-6 h-6 p-1", small: "w-8 h-8 p-1", medium: "w-10 h-10 p-2", large: "w-12 h-12 p-3" } // svgOnly
];

const shapes = {
    square: { tiny: "rounded", small: "rounded-md", medium: "rounded-xl", large: "rounded-2xl" },
    circle: { tiny: "rounded-full", small: "rounded-full", medium: "rounded-full", large: "rounded-full" },
};

export const Button = React.forwardRef(({
    size = "medium", type = "primary", shape = "square", svgOnly = false,
    children, prefix, suffix, shadow = false, loading = false, disabled = false, fullWidth = false,
    onClick, className, ...rest
}, ref) => {
    return (
        <button
            ref={ref} type="button" disabled={disabled || loading} onClick={onClick}
            className={clsx(
                "flex justify-center items-center gap-2 duration-150 font-medium transition-colors focus:outline-none",
                sizes[svgOnly ? 1 : 0][size],
                shapes[shape][size],
                shadow && "shadow-md border-none",
                fullWidth && "w-full",
                className
            )}
            {...rest}
        >
            {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : prefix}
            <span className={clsx("relative overflow-hidden whitespace-nowrap overflow-ellipsis font-sans")}>
                {children}
            </span>
            {!loading && suffix}
        </button>
    )
});

Button.displayName = "Button";
