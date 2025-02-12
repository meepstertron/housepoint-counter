'use client'

import { useState, useEffect, useRef } from 'react'
import { User, searchUsers, searchTeachers } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import useToken from './useToken'

interface SearchableUserSelectProps {
  onSelect: (user: User) => void
  userType: 'teacher' | 'student'
}

export function SearchableUserSelect({ onSelect, userType }: SearchableUserSelectProps) {
  const { token } = useToken();
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      if (query.length > 0 && token) {
        setIsLoading(true)
        try {
          const users = userType === 'teacher' ? await searchTeachers(query, token) : await searchUsers(query, token)
          setResults(users)
        } catch (error) {
          console.error(`Failed to search ${userType}s`, error)
        }
        setIsLoading(false)
        setIsOpen(true)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }

    const debounce = setTimeout(fetchUsers, 300)
    return () => clearTimeout(debounce)
  }, [query, token, userType])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (user: User) => {
    onSelect(user)
    setQuery(user.name)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="w-full"
      />
      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg"
        >
          <ScrollArea className="h-64">
            {isLoading ? (
              <div className="p-2 text-center text-gray-500">Loading...</div>
            ) : results.length > 0 ? (
              results.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => handleSelect(user)}
                >
                  <div>
                    <div>{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="p-2 text-center text-gray-500">No results found</div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

