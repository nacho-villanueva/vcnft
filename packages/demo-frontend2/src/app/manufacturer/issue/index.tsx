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
import {Link, useNavigate} from "react-router-dom";
import {AiFillCaretLeft} from "react-icons/ai";
import {apiInstance} from "@/utils/Axios";
import {ISSUER_NAME} from "@/app/manufacturer";
import {generateRandomVIN} from "@/utils/utils";

const FormSchema = z.object({
  claims: z.array(z.object({
    type: z.string(),
    value: z.string(),
  }))
})

function ManufacturerIssue() {
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      claims: [
        {type: "make", value: "ferrari"},
        {type: "model", value: ""},
        {type: "year", value: ""},
        {type: "vin", value: generateRandomVIN()}],
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    apiInstance.post(`/issuer/${ISSUER_NAME}/issue/vcnft`, {
      claims: Object.fromEntries(data.claims.map(claim => [claim.type, claim.value]))
    })
      .then(r => {
        toast({
          title: "Credential Request Issued",
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4 text-white">
              <div>
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

        navigate("/manufacturer/status/" + r.data._id)
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
