import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { updatePassword } from '@/lib/api'

const formSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).or(z.literal('')),
  confirmPassword: z.string().min(8).or(z.literal('')),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.newPassword === '' || data.confirmPassword === '' || (data.newPassword !== '' && data.confirmPassword !== ''), {
  message: "Both new password fields must be filled or both must be empty",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof formSchema>

interface PasswordFormProps {
  token: string
}

export default function PasswordForm({ token }: PasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await updatePassword(data.currentPassword, data.newPassword, token)
      alert('Password updated successfully!')
    } catch (error) {
      if (error instanceof Error) {
        alert('Error updating password: ' + error.message)
      } else {
        alert('An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          {...register('currentPassword')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.currentPassword && (
          <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          {...register('newPassword')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.newPassword && (
          <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          {...register('confirmPassword')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isLoading ? 'Updating...' : 'Update password'}
      </button>
    </form>
  )
}

