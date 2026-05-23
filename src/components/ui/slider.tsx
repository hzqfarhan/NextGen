"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  value: number[]
  min: number
  max: number
  step?: number
  onValueChange: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, min, max, step = 1, onValueChange, ...props }, ref) => {
    const val = typeof value[0] === 'number' ? value[0] : min

    return (
      <div className={cn("relative flex w-full items-center h-10", className)}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value)
            if (!isNaN(newValue)) {
              onValueChange([newValue])
            }
          }}
          className={cn(
            "w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer",
            "accent-primary hover:accent-primary/80",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            "transition-all"
          )}
          ref={ref}
          {...props}
        />
        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            background: white;
            border: 2px solid var(--color-primary, #8b5cf6);
            border-radius: 50%;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            cursor: pointer;
            transition: all 0.1s ease;
          }
          input[type='range']::-webkit-slider-thumb:active {
            transform: scale(1.2);
          }
          input[type='range']::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: white;
            border: 2px solid var(--color-primary, #8b5cf6);
            border-radius: 50%;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            cursor: pointer;
            transition: all 0.1s ease;
          }
        `}</style>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
