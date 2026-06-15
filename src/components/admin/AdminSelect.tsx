import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string | number
  label: React.ReactNode
  group?: string
}

interface AdminSelectProps {
  value: string | number | null | undefined
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  variant?: 'block' | 'small' | 'inline'
  disabled?: boolean
  width?: string
}

export function AdminSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className,
  variant = 'block',
  disabled = false,
  width,
}: AdminSelectProps) {
  // Coerce value to string for Radix Select compatibility
  const stringValue = value !== null && value !== undefined ? String(value) : ''

  // Group options by their group field
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, SelectOption[]> = {}
    const flat: SelectOption[] = []

    options.forEach(opt => {
      if (opt.group) {
        if (!groups[opt.group]) {
          groups[opt.group] = []
        }
        groups[opt.group].push(opt)
      } else {
        flat.push(opt)
      }
    })

    return { groups, flat }
  }, [options])

  // Get active selected label to show in Trigger
  const activeOption = React.useMemo(() => {
    return options.find(opt => String(opt.value) === stringValue)
  }, [options, stringValue])

  // Trigger styles
  const triggerCls = cn(
    // Common styles
    "focus:outline-none transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none",
    
    // Variant specific styles
    variant === 'block' && "w-full px-5 py-3 bg-[#F4F6FB] border border-slate-200 rounded-2xl text-slate-800 text-sm hover:border-slate-300 focus:border-amber-500/50 flex items-center justify-between gap-2 shadow-sm",
    
    variant === 'small' && "w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs font-bold hover:border-slate-400 focus:border-amber-500/50 flex items-center justify-between gap-2",
    
    variant === 'inline' && "inline-flex items-center gap-1 bg-transparent text-amber-500 hover:text-amber-600 text-sm font-bold",
    
    className
  )

  return (
    <SelectPrimitive.Root
      value={stringValue}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger className={triggerCls} style={{ width }}>
        <SelectPrimitive.Value placeholder={placeholder}>
          {activeOption ? activeOption.label : placeholder}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className={cn(
            "shrink-0 transition-transform duration-200 opacity-60",
            variant === 'inline' ? "w-3.5 h-3.5 text-amber-500" : "w-4 h-4 text-slate-600"
          )} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className={cn(
            "z-[200] max-h-72 overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-1.5 focus:outline-none",
            "shadow-[0_10px_30px_rgba(15,23,42,0.08),0_1px_4px_rgba(15,23,42,0.04)]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "duration-100 ease-out",
            // Make content match trigger width or minimum width
            "min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          <SelectPrimitive.Viewport className="w-full h-full overflow-y-auto">
            {groupedOptions.flat.map(opt => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}

            {Object.entries(groupedOptions.groups).map(([groupName, groupOpts]) => (
              <SelectPrimitive.Group key={groupName}>
                <SelectPrimitive.Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3.5 py-1.5 mt-1.5 first:mt-0">
                  {groupName}
                </SelectPrimitive.Label>
                {groupOpts.map(opt => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectPrimitive.Group>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:text-slate-900 cursor-pointer rounded-xl outline-none select-none data-[state=checked]:bg-amber-500/10 data-[state=checked]:text-amber-500 font-medium transition-colors",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-2" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
})
SelectItem.displayName = SelectPrimitive.Item.displayName
