'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getLogs } from "@/lib/api"

type LogLevel = 'info' | 'warn' | 'error'

interface Log {
  id: number
  timestamp: string
  level: LogLevel
  message: string
  module: string
  user_id: number | null
  username: string | null
  method: string | null
  url: string | null
  status_code: number | null
  stack_trace: string | null
  ip_address: string | null
  device: string | null
}

export default function LogsPage() {
  const [filter, setFilter] = useState<LogLevel | 'all'>('all')
  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    async function fetchLogs() {
      try {
        const fetchedLogs = await getLogs()
        const formattedLogs: Log[] = fetchedLogs.map(log => ({
          ...log,
          level: log.level as LogLevel
        }))
        setLogs(formattedLogs)
      } catch (error) {
        console.error("Failed to fetch logs:", error)
      }
    }
    fetchLogs()
  }, [])

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter)

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <div className="flex space-x-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'info' ? 'default' : 'outline'} onClick={() => setFilter('info')}>Info</Button>
            <Button variant={filter === 'warn' ? 'default' : 'outline'} onClick={() => setFilter('warn')}>Warn</Button>
            <Button variant={filter === 'error' ? 'default' : 'outline'} onClick={() => setFilter('error')}>Error</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">Level</th>
                  <th className="text-left p-2">Message</th>
                  <th className="text-left p-2">Module</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-left p-2">URL</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">IP</th>
                  <th className="text-left p-2">Device</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="p-2 text-sm">{log.timestamp}</td>
                    <td className="p-2">
                      <LogLevelBadge level={log.level} />
                    </td>
                    <td className="p-2 text-sm">{log.message}</td>
                    <td className="p-2 text-sm">{log.module}</td>
                    <td className="p-2 text-sm">{log.username || log.user_id}</td>
                    <td className="p-2 text-sm">{log.method}</td>
                    <td className="p-2 text-sm">{log.url}</td>
                    <td className="p-2 text-sm">{log.status_code}</td>
                    <td className="p-2 text-sm">{log.ip_address}</td>
                    <td className="p-2 text-sm">{log.device}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function LogLevelBadge({ level }: { level: LogLevel }) {
  switch (level) {
    case 'info':
      return <Badge variant="secondary">Info</Badge>
    case 'warn':
      return <Badge variant="default">Warn</Badge>
    case 'error':
      return <Badge variant="destructive">Error</Badge>
  }
}

