"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { addHousePoints } from '../lib/api'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import useToken from '@/components/useToken'
import { SearchableUserSelect } from '@/components/searchable-user-select'
import { useEffect, useState } from 'react'

const formSchema = z.object({
  studentId: z.number().min(1, { message: "Student ID is required" }),
  points: z.number().min(1, { message: "Points must be at least 1" }),
  reason: z.string().min(1, { message: "Reason is required" }),
})

export function AwardHSP() {
  const [usedURL, setUsedURL] = useState(false);
  const { toast } = useToast()
  const { token } = useToken()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 0,
      points: 0,
      reason: "",
    },
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const student = urlParams.get('student')
    if (student) {
      setUsedURL(true);
      form.setValue('studentId', parseInt(student, 10))
      setTimeout(() => {
        toast({
          title: "Info",
          description: "Used selected user from table.",
        })
      }, 500); // Delay of 500ms
    }
  }, [form, toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!token) {
        throw new Error("Token is missing")
      }
      await addHousePoints({ ...values, studentId: values.studentId.toString(), points: values.points.toString() }, token)
      toast({
        title: "Success",
        description: "House points awarded successfully.",
      })
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to award house points. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Award House Points</CardTitle>
        <CardDescription>Give points to students for their achievements.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    {!usedURL ? (
                      <SearchableUserSelect onSelect={(user) => field.onChange(user.id)} userType="student" />
                    ) : (
                      <Input type="number" value={field.value} readOnly />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter points" {...field} onChange={event => field.onChange(+event.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter reason for awarding points" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Award Points</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

