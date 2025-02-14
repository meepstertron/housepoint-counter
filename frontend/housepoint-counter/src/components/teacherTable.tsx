'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusIcon, Pencil, Trash2 } from 'lucide-react'
import { User, getAllTeachers, deleteTeacher, addTeacher, updateTeacher } from '@/lib/api'
import useToken from './useToken'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useForm } from 'react-hook-form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from '@/components/ui/switch'
import { Label } from "@/components/ui/label"

export default function UserTable() {
  const { token } = useToken()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editData, setEditData] = useState<{[key: string]: any}>({})
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() => {
    const fetchTeachers = async () => {
      if (token) {
        try {
          const teachers = await getAllTeachers(token)
          setUsers(teachers)
        } catch (error) {
          console.error("Failed to fetch teachers", error)
        }
        setIsLoading(false)
      }
    }
    fetchTeachers()
  }, [token])

  const addNewUser = () => {
    setIsDialogOpen(true)
  }

  const handleDelete = async (userId: number) => {
    if (token) {
      try {
        await deleteTeacher(userId, token)
        setUsers(users.filter(user => user.id !== userId.toString()))
      } catch (error) {
        console.error("Failed to delete teacher", error)
      }
    }
  }

  const onSubmit = async (data: any) => {
    if (token) {
      try {
        await addTeacher(data, token)
        setUsers([...users, data])
        setIsDialogOpen(false)
        reset()
      } catch (error) {
        console.error("Failed to add teacher", error)
      }
    }
  }

  const handleEditChange = (userId: string, field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [field]: value
      }
    }))
  }

  const handleEditSubmit = async (user: User) => {
    if (token) {
      try {
        const updatedData = {
          ...user,
          ...editData[user.id]
        }
        await updateTeacher(updatedData, token)
        setUsers(users.map(u => u.id === user.id ? updatedData : u))
        setEditData(prev => {
          const newData = { ...prev }
          delete newData[user.id]
          return newData
        })
        setUpdateSuccess(true)
        setTimeout(() => setUpdateSuccess(false), 2000)
      } catch (error) {
        console.error("Failed to update teacher", error)
      }
    }
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={addNewUser}>
                <PlusIcon className="mr-2 h-4 w-4" /> Add New Teacher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <Input {...register("name")} placeholder="Name" required />
                  <Input {...register("email")} type="email" placeholder="Email" required />
                  <Input {...register("password")} type="password" placeholder="Password" required />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Teacher</Button>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Is Admin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.admin ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <form className="space-y-4" onSubmit={(e) => {
                              e.preventDefault()
                              handleEditSubmit(user)
                            }}>
                              <h4 className="font-medium leading-none">Edit Teacher</h4>
                              <Input 
                                defaultValue={user.name}
                                placeholder="Name" 
                                onChange={(e) => handleEditChange(user.id, 'name', e.target.value)}
                              />
                              <Input 
                                defaultValue={user.email}
                                type="email" 
                                placeholder="Email" 
                                onChange={(e) => handleEditChange(user.id, 'email', e.target.value)}
                              />
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={editData[user.id]?.admin ?? user.admin}
                                  onCheckedChange={(checked) =>
                                    handleEditChange(user.id, 'admin', checked)
                                  }
                                  id={`admin-switch-${user.id}`}
                                  className={parseInt(user.id) === 1 ? 'cursor-not-allowed disabled' : ''}
                                  disabled={parseInt(user.id) === 1}
                                />
                                <Label htmlFor={`admin-switch-${user.id}`}>Is Admin?</Label>
                              </div>
                              <Input 
                                type="password" 
                                placeholder="New Password (optional)" 
                                onChange={(e) => handleEditChange(user.id, 'password', e.target.value)}
                              />
                              <div className="flex justify-end space-x-2">
                                {updateSuccess && <span className="text-green-600">Updated successfully!</span>}
                                <Button type="submit">Save</Button>
                              </div>
                            </form>
                          </PopoverContent>
                        </Popover>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleDelete(parseInt(user.id))} 
                              disabled={parseInt(user.id) === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          {parseInt(user.id) === 1 && (
                            <TooltipContent>
                              <p>Cannot delete the default user</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No teachers found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  )
}

