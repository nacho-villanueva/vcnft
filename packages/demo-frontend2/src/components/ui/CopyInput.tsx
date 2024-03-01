import * as React from "react"

import {cn} from "@/utils/utils"
import {toast} from "@/components/ui/use-toast";
import {Button} from "@/components/ui/button";
import {CopyIcon} from "@radix-ui/react-icons";
import {Input} from "@/components/ui/input";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
}

const CopyInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({className, type, ...props}, ref) => {

    const {
      readonly,
      value,
      onClick,
      ...rest
    } = props

    function handleCopy() {
      didInputRef.current?.select();
      didInputRef.current?.setSelectionRange(0, 99999);

      if (attributes.ethrDid?.did)
        navigator.clipboard.writeText(value);

      toast({
        title: "Copied to clipboard"
      })

      onClick?.()
    }

    const inputRef = React.useRef<HTMLInputElement>(null)

    return (
      <span className={cn("flex items-center", className)}>
        <Input className={"max-w-[80%] truncate border-none h-2 px-1"} readOnly {...rest}
               value={value} ref={inputRef} />
        <Button size={"icon"} className={"w-6 h-6"} variant={"ghost"}
              onClick={handleCopy}><CopyIcon/></Button>
        </span>
    )
  }
)
CopyInput.displayName = "Input"

export {CopyInput}
