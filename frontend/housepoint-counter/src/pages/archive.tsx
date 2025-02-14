import { useEffect, useState } from 'react';
import { getArchived, archivePoints } from '../lib/api';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useToken from '@/components/useToken';
import { Switch } from '@/components/ui/switch';

interface ArchiveEntry {
    id: number;
    student_count: number;
    houses: Array<{
        house_id: number;
        house_name: string;
        total_points: number;
    }>;
    timestamp: string;
}

function Archive_Page() {
    const [archives, setArchives] = useState<ArchiveEntry[]>([]);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [resetPoints, setResetPoints] = useState<boolean>(false);

    const loadArchives = async () => {
        try {
            const data = await getArchived();
            setArchives(data);
        } catch (err) {
            setError('Failed to load archives');
        }
    };

    useEffect(() => {
        loadArchives();
    }, []);

    const { token } = useToken();
    
    const handleCreateArchive = async () => {
        try {
            await archivePoints(token, resetPoints);
            setSuccess('Successfully created new archive!');
            loadArchives(); // Reload the archives
        } catch (err) {
            setError('Failed to create archive');
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>The Archive</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="mb-4">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="space-y-4">
                        <Button 
                            className="w-full sm:w-auto"
                            onClick={handleCreateArchive}
                        >
                            Create New Archive
                        </Button>
                        <div className="flex items-center space-x-3 p-2 rounded-lg bg-secondary/20">
                            <Switch id="reset-points" checked={resetPoints} onCheckedChange={setResetPoints} />
                            <label htmlFor="reset-points" className="text-sm text-muted-foreground">
                                Reset points (set to true if this is a new year)
                            </label>
                        </div>
                    </div>

                    <Table>
                        <TableCaption>A list of all archived house points</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Total Students</TableHead>
                                <TableHead>House Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {archives.map((archive) => (
                                <TableRow key={archive.id}>
                                    <TableCell>{archive.timestamp}</TableCell>
                                    <TableCell>{archive.student_count}</TableCell>
                                    <TableCell>
                                        <ul className="list-disc list-inside">
                                            {archive.houses.map((house) => (
                                                <li key={house.house_id}>
                                                    {house.house_name}: {house.total_points} points
                                                </li>
                                            ))}
                                        </ul>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default Archive_Page;