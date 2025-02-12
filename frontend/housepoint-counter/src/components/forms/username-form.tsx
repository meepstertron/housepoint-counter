import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/hooks/use-toast'
import { updateUsername } from '@/lib/api'

const formSchema = z.object({
  username: z.string().min(2).max(30),
})

type FormData = z.infer<typeof formSchema>

interface UsernameFormProps {
  initialUsername: string
  token: string
}

export default function UsernameForm({ initialUsername, token }: UsernameFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: initialUsername,
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await updateUsername(data.username, token)
      toast({ title: 'Username updated successfully!' })
    } catch (error) {
      toast({ title: 'Error updating username', description: (error as any).message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          {...register('username')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder={initialUsername}
        />
        {errors.username && (
          <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isLoading ? 'Updating...' : 'Update username'}
      </button>
    </form>
  )
}

