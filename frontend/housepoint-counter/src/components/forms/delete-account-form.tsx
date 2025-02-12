import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { deleteAccount } from '@/lib/api'
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  confirmDelete: z.literal('DELETE'),
})

type FormData = z.infer<typeof formSchema>

interface DeleteAccountFormProps {
  token: string
}

export default function DeleteAccountForm({ token }: DeleteAccountFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async () => {
    setIsLoading(true)
    try {
      await deleteAccount(token)
      toast({
        title: "Deleted account",
        description: "It was nice having you, see you soon!",
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.clear()
      location.replace('/')
    } catch (error) {
      toast({
        title: "Error deleting account",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="confirmDelete" className="block text-sm font-medium text-gray-700">
          Delete Account
        </label>
        <input
          type="text"
          id="confirmDelete"
          {...register('confirmDelete')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder='Type "DELETE" to confirm'
        />
        {errors.confirmDelete && (
          <p className="mt-2 text-sm text-red-600">{errors.confirmDelete.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        {isLoading ? 'Deleting...' : 'Delete Account'}
      </button>
    </form>
  )
}

