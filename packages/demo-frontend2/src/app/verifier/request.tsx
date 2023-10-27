// @flow
import * as React from 'react';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {MinusIcon, PlusIcon} from "@radix-ui/react-icons";
import {useForm, useFieldArray} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {apiInstance} from "@/utils/Axios";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

const FormSchema = z.object({
    claims: z.array(z.object({
        id: z.string(),
        value: z.string(),
    }))
});

export const RequestVerification = () => {
    const [sending, setSending] = useState(false)
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            claims: [
                {id: '1', value: "numberplate"},
            ],
        }
    })

    const {control, setValue, handleSubmit} = form;
    const {fields, append, remove} = useFieldArray({
        control,
        name: "claims"
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        setSending(true)
        apiInstance.put("/verifier/verify", {
            claims: data.claims.map(c => c.value)
        }).then(r => {
            navigate(`/verifier/verify/${r.data}`)
        }).finally(() => setSending(false))
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
                <FormField
                    control={form.control}
                    name={"claims"}
                    render={({field: fieldArray}) => (
                        <FormItem className={"w-[100%]"}>
                            <FormLabel>Claims</FormLabel>
                            {fields.map((claim, index) => (
                                <FormField
                                    key={claim.id}
                                    control={control}
                                    name={`claims.${index}.value`}
                                    render={({field}) => (
                                        <FormItem
                                            className={"flex-1 items-center justify-center gap-2 flex min-w-[100px]"}>
                                            <FormControl>
                                                <Input placeholder="Claim (e.g: Model)" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            ))}
                            <div className={"flex justify-evenly"}>
                                <Button variant={"ghost"} type={"button"}
                                        onClick={() => remove(fields.length - 1)}>
                                    <MinusIcon/>
                                </Button>
                                <Button variant={"ghost"} type={"button"}
                                        onClick={() => {
                                            const newClaim = {id: Date.now().toString(), value: ""};
                                            append(newClaim);
                                        }}>
                                    <PlusIcon/>
                                </Button>
                            </div>
                        </FormItem>
                    )}
                />

                <div className={"flex justify-end"}>
                    <Button type="submit">Request</Button>
                </div>
            </form>
        </Form>
    );
};
