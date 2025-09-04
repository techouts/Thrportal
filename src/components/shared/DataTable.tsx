import React, { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  MoreHorizontal,
  Save,
  RefreshCw
} from 'lucide-react'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  id: string
  header: string
  accessor: keyof T | ((row: T) => any)
  cell?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }
  searchable?: boolean
  onSearch?: (query: string) => void
  exportable?: boolean
  onExport?: (format: 'csv' | 'xlsx') => void
  savedViews?: {
    current?: string
    views: Array<{ id: string; name: string }>
    onSave: (name: string) => void
    onLoad: (id: string) => void
  }
  actions?: (row: T) => React.ReactNode
  emptyMessage?: string
  testId?: string
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  searchable = true,
  onSearch,
  exportable = true,
  onExport,
  savedViews,
  actions,
  emptyMessage = "No data available",
  testId = "data-table"
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  const filteredData = useMemo(() => {
    if (!searchQuery || onSearch) return data
    
    return data.filter((row) =>
      columns.some((column) => {
        const value = typeof column.accessor === 'function' 
          ? column.accessor(row)
          : row[column.accessor]
        return String(value).toLowerCase().includes(searchQuery.toLowerCase())
      })
    )
  }, [data, searchQuery, columns, onSearch])

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData
    
    return [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.id === sortConfig.key)
      if (!column) return 0
      
      const aValue = typeof column.accessor === 'function'
        ? column.accessor(a)
        : a[column.accessor]
      const bValue = typeof column.accessor === 'function'
        ? column.accessor(b)
        : b[column.accessor]
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig, columns])

  const handleSort = (columnId: string) => {
    setSortConfig(current => ({
      key: columnId,
      direction: current?.key === columnId && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (sortedData.length === 0) {
    return (
      <EmptyState
        title="No data found"
        description={emptyMessage}
        icon="table"
      />
    )
  }

  return (
    <div className="space-y-4" data-test-id={testId}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {searchable && (
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-64"
              data-test-id={`${testId}-search`}
            />
          )}
          
          {savedViews && (
            <div className="flex items-center gap-2">
              <Select value={savedViews.current} onValueChange={savedViews.onLoad}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  {savedViews.views.map((view) => (
                    <SelectItem key={view.id} value={view.id}>
                      {view.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const name = prompt('Enter view name:')
                  if (name) savedViews.onSave(name)
                }}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {exportable && onExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('xlsx')}>
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={`${column.width || ''} ${column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {sortConfig?.key === column.id && (
                      <Badge variant="secondary" className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow key={index} data-test-id={`${testId}-row-${index}`}>
                {columns.map((column) => {
                  const value = typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : row[column.accessor]
                  
                  return (
                    <TableCell key={column.id}>
                      {column.cell ? column.cell(value, row) : String(value)}
                    </TableCell>
                  )
                })}
                {actions && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions(row)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => pagination.onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium px-3">
              {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}