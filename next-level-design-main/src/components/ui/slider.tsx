import * as React from "react"

interface SliderProps {
    value: number[]
    min: number
    max: number
    step: number
    onValueChange: (value: number[]) => void
    className?: string
    variant?: 'primary' | 'accent'
}

export const Slider: React.FC<SliderProps> = ({ value, min, max, step, onValueChange, className, variant = 'primary' }) => {
    const accentClass = variant === 'primary' ? 'accent-primary' : 'accent-accent';

    return (
        <div className={`relative w-full h-6 flex items-center ${className || ""}`}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[0]}
                onChange={(e) => onValueChange([parseInt(e.target.value)])}
                className={`w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer ${accentClass} transition-all`}
            />
        </div>
    )
}
