import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookUser, Notebook, OctagonAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import UserTable from "../components/teacherTable";
import { clearAllHousePoints, deleteAllStudents } from "@/lib/api";
import useToken from "@/components/useToken";
import LogsPage from "./logs";

function Admin_Page() {
    const { toast } = useToast()
    const { token } = useToken()

    async function handleClearHousepoints() {
        if (token) {
            try {
                await clearAllHousePoints(token)
                toast({
                    title: "Success",
                    description: "All house points have been cleared.",
                })
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to clear house points. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    async function handleDeleteAllStudents() {
        if (token) {
            try {
                await deleteAllStudents(token)
                toast({
                    title: "Success",
                    description: "All students have been deleted.",
                })
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete all students. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    return ( 
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin</h1>

            <Tabs defaultValue="teachers" className="w-full">
            <TabsList>
                <TabsTrigger value="teachers">
                    <BookUser className="w-5 h-5 mr-2" />
                    Teachers
                    </TabsTrigger>
                <TabsTrigger value="logs">
                    <Notebook className="w-5 h-5 mr-2" />
                    Logs
                    </TabsTrigger>
                <TabsTrigger value="danger" className="text-red-700">
                    <OctagonAlert className="w-5 h-5 mr-2" />
                    Danger Zone
                    </TabsTrigger>
            </TabsList>
            <TabsContent value="teachers" className="w-full">
                <p className="text-xl pb-5">Manage Teachers</p>
                <UserTable />
            </TabsContent>
            <TabsContent value="logs">
                
                <LogsPage />
            </TabsContent>
            <TabsContent value="danger">
                <p className="text-red-700 text-xl pb-5">Danger Zone</p>
                <p>Be careful with these actions. They cannot be undone.</p>
                <AlertDialog>
                    <AlertDialogTrigger><Button className="mt-4" variant="destructive">Clear Housepoints</Button></AlertDialogTrigger>
                    
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently reset all housepoints.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearHousepoints}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                
                
                <AlertDialog>
                    <AlertDialogTrigger><Button className="mt-4 ml-4" variant="destructive">Delete all students</Button></AlertDialogTrigger>
                    
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently DELETE every single student.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllStudents}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <div className="grid w-full gap-1.5 mt-4">
                    <Label htmlFor="message">Run sql on database</Label>
                    <Label htmlFor="message" className="text-gray-500 text-xs">This will run raw unchecked sql on the database, only use this if you know what you are doing (needs to be enabled in config)</Label>
                    <Textarea placeholder="Type your message here." id="message" />
                </div>

            </TabsContent>
            </Tabs>
        </div>
     );
}

export default Admin_Page;