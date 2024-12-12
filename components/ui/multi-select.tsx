"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "@/lib/utils"

export type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected?: string[]
  value?: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
  badgeClassName?: string
}

export function MultiSelect({
  options,
  selected,
  value,
  onChange,
  placeholder = "Select items...",
  className,
  badgeClassName,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  // Use either selected or value prop, defaulting to empty array
  const selectedValues = selected || value || []

  const handleUnselect = (value: string) => {
    onChange(selectedValues.filter((s) => s !== value))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && selectedValues.length > 0) {
          handleUnselect(selectedValues[selectedValues.length - 1])
        }
      }
      if (e.key === "Escape") {
        input.blur()
      }
    }
  }

  const selectables = options?.filter((option) => !selectedValues?.includes(option.value)) || []

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn(
        "overflow-visible bg-transparent",
        className
      )}
    >
      <div
        className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <div className="flex flex-wrap gap-1">
          {selectedValues.map((selectedValue) => {
            const option = options.find((opt) => opt.value === selectedValue)
            if (!option) return null
            return (
              <Badge
                key={selectedValue}
                variant="custom"
                className={cn(
                  "rounded-md px-2 py-1 text-sm font-medium transition-none hover:bg-none",
                  {
                    'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-800': selectedValues.indexOf(selectedValue) % 5 === 0,
                    'bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800': selectedValues.indexOf(selectedValue) % 5 === 1,
                    'bg-purple-100 text-purple-800 hover:bg-purple-200 hover:text-purple-800': selectedValues.indexOf(selectedValue) % 5 === 2,
                    'bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-800': selectedValues.indexOf(selectedValue) % 5 === 3,
                    'bg-pink-100 text-pink-800 hover:bg-pink-200 hover:text-pink-800': selectedValues.indexOf(selectedValue) % 5 === 4,
                  },
                  badgeClassName
                )}
              >
                {option.label}
                <button
                  className={cn(
                    "ml-1.5 rounded-full p-0.5 hover:bg-black/10",
                    {
                      'text-blue-600 hover:bg-blue-200 hover:text-blue-900': selectedValues.indexOf(selectedValue) % 5 === 0,
                      'text-green-600 hover:bg-green-200 hover:text-green-900': selectedValues.indexOf(selectedValue) % 5 === 1,
                      'text-purple-600 hover:bg-purple-200 hover:text-purple-900': selectedValues.indexOf(selectedValue) % 5 === 2,
                      'text-orange-600 hover:bg-orange-200 hover:text-orange-900': selectedValues.indexOf(selectedValue) % 5 === 3,
                      'text-pink-600 hover:bg-pink-200 hover:text-pink-900': selectedValues.indexOf(selectedValue) % 5 === 4,
                    }
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(selectedValue)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleUnselect(selectedValue)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={selectedValues.length === 0 ? placeholder : undefined}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[5px]">
            <div className="w-[90vw] max-w-2xl rounded-2xl border bg-gradient-to-b from-gray-50 to-gray-100 shadow-2xl outline-none animate-in">
              <div className="p-5">
                <div className="mb-4 border-b pb-3">
                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Select Options
                  </h2>
                  <p className="mt-1 text-base text-gray-600">
                    Choose exercise types to include in this topic
                  </p>
                </div>
                <CommandGroup className="max-h-[60vh] overflow-auto">
                  <div className="grid grid-cols-2 gap-3 px-1 md:grid-cols-3">
                    {selectables.map((option) => {
                      return (
                        <CommandItem
                          key={option.value}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          onSelect={() => {
                            setInputValue("")
                            onChange([...selectedValues, option.value])
                          }}
                          className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-md transition-all duration-300 ease-in-out hover:border-blue-500 hover:bg-blue-100 hover:shadow-lg hover:scale-105"
                        >
                          <span className="font-semibold text-gray-800 group-hover:text-blue-800">
                            {option.label}
                          </span>
                        </CommandItem>
                      )
                    })}
                  </div>
                </CommandGroup>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Command>
  )
}
