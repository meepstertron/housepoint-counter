'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { getAllStudents, addStudent, deleteStudent, Student, User, updateStudent } from '@/lib/api'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import useToken from './useToken'
import { SearchableUserSelect } from './searchable-user-select'
import { getAllHouses, House } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

export default function SearchableStudentTable() {
  const { token } = useToken();
  const [students, setStudents] = useState<Student[]>([])
  const [houses, setHouses] = useState<House[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof Student>('first_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    grad_year: '',
    points: '',
    teacher_id: '1',
    house: '' // Add house field
  })
  const [loading, setLoading] = useState(true)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  useEffect(() => {
    async function fetchStudents() {
      if (token) {
        setLoading(true)
        const students = await getAllStudents(token)
        setStudents(students)
        setLoading(false)
      }
    }
    fetchStudents()
  }, [token])

  useEffect(() => {
    async function fetchHouses() {
      if (token) {
        const houses = await getAllHouses(token)
        setHouses(houses)
      }
    }
    fetchHouses()
  }, [token])

  const handleSort = (column: keyof Student) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setNewStudent(prevState => ({
      ...prevState,
      [id]: value
    }))
  }

  const handleTeacherSelect = (teacher: User) => {
    setNewStudent(prevState => ({
      ...prevState,
      teacher_id: teacher.id
    }))
  }

  const handleHouseSelect = (houseId: number) => {
    setNewStudent(prevState => ({
      ...prevState,
      house: houseId.toString()
    }))
  }

  const handleAddStudent = async () => {
    try {
      if (token) {
        const studentData = {
          ...newStudent,
          house: Number(newStudent.house),  // Ensure house is a number
          points: Number(newStudent.points),  // Ensure points is a number
          grad_year: Number(newStudent.grad_year)  // Ensure grad_year is a number
        }
        await addStudent({ ...studentData, id: 0, teacher_name: '' } as Student, token)
        const students = await getAllStudents(token)
        setStudents(students)
      }
    } catch (error) {
      console.error("Failed to add student", error)
    }
  }

  const handleDeleteStudent = async (studentId: number) => {
    try {
      if (token) {
        await deleteStudent(studentId, token)
        const students = await getAllStudents(token)
        setStudents(students)
      }
    } catch (error) {
      console.error("Failed to delete student", error)
    }
  }

  const handleEditStudent = async (studentData: Student) => {
    try {
      if (token) {
        await updateStudent({
          id: studentData.id,
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          grad_year: Number(studentData.grad_year),
          points: Number(studentData.points),
          house: Number(studentData.house),
          teacher_name: studentData.teacher_name
        }, token);
        const students = await getAllStudents(token);
        setStudents(students);
        setEditingStudent(null);
      }
    } catch (error) {
      console.error("Failed to update student", error);
    }
  };

  const handleEditInputChange = (field: keyof Student, value: string | number) => {
    setEditingStudent(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const filteredAndSortedStudents = students
    .filter(student =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grad_year.toString().includes(searchTerm) ||
      student.points.toString().includes(searchTerm) ||
      student.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          type="search"
          placeholder="Search students..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">Add new student</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Add New Student</h4>
                <p className="text-sm text-muted-foreground">
                  Fill in the details of the new student.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={newStudent.first_name}
                    onChange={handleInputChange}
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={newStudent.last_name}
                    onChange={handleInputChange}
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="grad_year">Graduation Year</Label>
                  <Input
                    id="grad_year"
                    value={newStudent.grad_year}
                    onChange={handleInputChange}
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    value={newStudent.points}
                    onChange={handleInputChange}
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="house">House</Label>
                  <select
                    id="house"
                    value={newStudent.house}
                    onChange={(e) => handleHouseSelect(Number(e.target.value))}
                    className="col-span-2 h-8"
                  >
                    <option value="">Select House</option>
                    {houses.map(house => (
                      <option key={house.id} value={house.id}>{house.name}</option>
                    ))}
                  </select>
                </div>
                <div className=" grid-cols-3 items-center gap-4 hidden">
                  <Label htmlFor="teacher_id">Homeroom Teacher</Label>
                  <div className="col-span-2">
                    <SearchableUserSelect userType="teacher" onSelect={handleTeacherSelect} />
                  </div>
                </div>
                <Button onClick={handleAddStudent}>Add Student</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('first_name')} className="cursor-pointer">
                First Name <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead onClick={() => handleSort('last_name')} className="cursor-pointer">
                Last Name <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead onClick={() => handleSort('grad_year')} className="cursor-pointer">
                Graduation Year <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead onClick={() => handleSort('points')} className="cursor-pointer">
                Points <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead onClick={() => handleSort('house')} className="cursor-pointer">
                House <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead onClick={() => handleSort('teacher_name')} className="cursor-pointer hidden">
                Homeroom Teacher <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.first_name}</TableCell>
                <TableCell>{student.last_name}</TableCell>
                <TableCell>{student.grad_year}</TableCell>
                <TableCell>{student.points}</TableCell>
                <TableCell>{houses.find(house => house.id === student.house)?.name || 'Unknown'}</TableCell>
                <TableCell className='hidden'>{student.teacher_name}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => window.location.href = `/award?student=${student.id.toString()}`}>
                        Award Housepoints
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Edit student
                          </DropdownMenuItem>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">Edit Student</h4>
                              <p className="text-sm text-muted-foreground">
                                Modify the student's details.
                              </p>
                            </div>
                            <div className="grid gap-2" onFocus={() => !editingStudent && setEditingStudent(student)}>
                              <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor={`edit-first-name-${student.id}`}>First Name</Label>
                                <Input
                                  id={`edit-first-name-${student.id}`}
                                  value={editingStudent?.first_name ?? student.first_name}
                                  onChange={(e) => handleEditInputChange('first_name', e.target.value)}
                                  className="col-span-2 h-8"
                                />
                              </div>
                              <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor={`edit-last-name-${student.id}`}>Last Name</Label>
                                <Input
                                  id={`edit-last-name-${student.id}`}
                                  value={editingStudent?.last_name ?? student.last_name}
                                  onChange={(e) => handleEditInputChange('last_name', e.target.value)}
                                  className="col-span-2 h-8"
                                />
                              </div>
                              <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor={`edit-grad-year-${student.id}`}>Grad Year</Label>
                                <Input
                                  id={`edit-grad-year-${student.id}`}
                                  value={editingStudent?.grad_year ?? student.grad_year}
                                  onChange={(e) => handleEditInputChange('grad_year', Number(e.target.value))}
                                  className="col-span-2 h-8"
                                />
                              </div>
                              <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor={`edit-points-${student.id}`}>Points</Label>
                                <Input
                                  id={`edit-points-${student.id}`}
                                  value={editingStudent?.points ?? student.points}
                                  onChange={(e) => handleEditInputChange('points', Number(e.target.value))}
                                  className="col-span-2 h-8"
                                />
                              </div>
                              <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor={`edit-house-${student.id}`}>House</Label>
                                <select
                                  id={`edit-house-${student.id}`}
                                  value={editingStudent?.house ?? student.house}
                                  onChange={(e) => handleEditInputChange('house', Number(e.target.value))}
                                  className="col-span-2 h-8"
                                >
                                  <option value="">Select House</option>
                                  {houses.map(house => (
                                    <option key={house.id} value={house.id}>{house.name}</option>
                                  ))}
                                </select>
                              </div>
                              <Button 
                                onClick={() => {
                                  if (editingStudent) {
                                    handleEditStudent(editingStudent);
                                  }
                                }}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <DropdownMenuItem className="text-red-700" onClick={() => handleDeleteStudent(student.id)}>
                        Delete student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

