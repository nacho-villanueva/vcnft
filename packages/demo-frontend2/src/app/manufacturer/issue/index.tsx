"use client"

import {useForm} from "react-hook-form"
import * as z from "zod"
import {isAddress} from "ethers"

import {Button} from "@/components/ui/button"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {toast} from "@/components/ui/use-toast"
import {zodResolver} from "@hookform/resolvers/zod";
import {MinusIcon, PlusIcon} from "@radix-ui/react-icons";
import {Link} from "react-router-dom";
import {AiFillCaretLeft} from "react-icons/ai";
import {apiInstance} from "@/utils/Axios";
import {ISSUER_NAME} from "@/app/manufacturer";

const FormSchema = z.object({
  forAddress: z.string()
    .startsWith("0x", {message: "Blockchain address must start with 0x"})
    .refine((v) => isAddress(v), {message: "Invalid blockchain address"}),
  claims: z.array(z.object({
    type: z.string(),
    value: z.string(),
  }))
})

function ManufacturerIssue() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      forAddress: "",
      claims: [{type: "", value: ""}, {type: "", value: ""}, {type: "", value: ""}],
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    apiInstance.post(`/issuer/${ISSUER_NAME}/issue/vcnft`, {
      to: data.forAddress,
      claims: Object.fromEntries(data.claims.map(claim => [claim.type, claim.value]))
    })
      .then(r => {
        toast({
          title: "Credential Issued",
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4 text-white">
              <div>
                <span className={"max-w-full"}>For: <b
                  className={"w-2 truncate"}>{data.forAddress.slice(0, 5)}...{data.forAddress.slice(-4, data.forAddress.length)}</b></span>
                <p>Claims:</p>
                <ul className={"list-disc px-4 text-sm"}>
                {data.claims.map((claim, index) => (
                  <li key={index}>{claim.type}: <b>{claim.value}</b></li>
                ))}
                  </ul>
              </div>
              <br/>
              <p>Credential ID: <b>{r.data._id}</b></p>
            </pre>
          ),
        })
      }).catch(err => {
        toast({
          title: "Error Issuing Credential",
          variant: "destructive",
          description: err.response?.data?.message || "Something went wrong",
        })
    })
  }


  return (
    <div className={"flex flex-col items-center w-full max-w-[545px]"}>
      <div className={"flex w-full align-start"}>
        <Button variant={"link"} asChild><Link to={"/manufacturer"}><AiFillCaretLeft/>Back</Link></Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
          <FormField
            control={form.control}
            name="forAddress"
            render={({field}) => (
              <FormItem>
                <FormLabel>For Address</FormLabel>
                <FormControl>
                  <Input placeholder="0x00000000000000000000000000" {...field} />
                </FormControl>
                <FormDescription className={"text-xs"}>
                  This is blockchain address of who is receiving the credential.
                </FormDescription>
                <FormMessage/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"claims"}
            render={({field: fieldArray}) => (
              <FormItem className={"w-[100%]"}>
                <FormLabel>Claims</FormLabel>
                {fieldArray.value?.map((claim, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`claims.${index}`}
                    render={({field}) => (<FormItem>
                      <div className={"flex flex-wrap gap-4 w-fill flex-1 items-center justify-center"}>
                        <FormField
                          control={form.control}
                          name={`claims.${index}.type`}
                          render={({field}) => (
                            <FormItem className={"flex-1 min-w-[100px]"}>
                              {/*<FormLabel>Type</FormLabel>*/}
                              <FormControl>
                                <Input placeholder="Claim (e.g: Model)" {...field} />
                              </FormControl>
                            </FormItem>
                          )}/>
                        <FormField
                          control={form.control}
                          name={`claims.${index}.value`}
                          render={({field}) => (
                            <FormItem className={"flex-1 items-center justify-center gap-2  flex min-w-[100px]"}>
                              {/*<FormLabel>Value</FormLabel>*/}
                              <FormControl>
                                <Input placeholder="Value (e.g: Enzo)" {...field} />
                              </FormControl>
                            </FormItem>
                          )}/>
                      </div>
                    </FormItem>)}/>
                ))}
                <div className={"flex justify-evenly"}>
                  <Button variant={"ghost"} type={"button"}
                          onClick={() => fieldArray.onChange(() => fieldArray.value.slice(0, -1))}>
                    <MinusIcon/>
                  </Button>
                  <Button variant={"ghost"} type={"button"}
                          onClick={() => fieldArray.onChange(() => fieldArray.value.concat([{type: "", value: ""}]))}>
                    <PlusIcon/>
                  </Button>
                </div>
              </FormItem>
            )}
          />

          <div className={"flex justify-end"}>
            <Button type="submit">Issue</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}


export default ManufacturerIssue;
