import SearchableStudentTable from '@/components/studentTable'

export default function Page() {
  return (
    <div className="container mx-auto py-10 pl-5">
      <h1 className="text-2xl font-bold mb-5">Student Records</h1>
      <SearchableStudentTable />
    </div>
  )
}