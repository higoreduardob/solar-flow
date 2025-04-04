'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Ban, ChevronDown, Trash2 } from 'lucide-react'

import { useConfirm } from '@/hooks/use-confirm'

import { FilterOptionsPageSize, FilterStatus } from '@/constants'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SelectFilter } from '@/components/select-filter'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterKey: string
  placeholder: string
  isNonReversibled?: boolean
  isNonExportable?: boolean
  statusFilter?: FilterOptionsProps
  disabled?: boolean
  status?: string
  onDelete: (rows: Row<TData>[]) => void
  onChangeStatus: (status: string) => void
  filters?: React.JSX.Element
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  placeholder,
  isNonReversibled,
  isNonExportable,
  statusFilter,
  disabled,
  status,
  onDelete,
  onChangeStatus,
  filters,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    `Após efetuar essa ação, você ${
      isNonReversibled
        ? 'não poderá reverter'
        : 'poderá reverter filtrando suas condições'
    }.`,
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleBulkDelete = async () => {
    const ok = await confirm()
    if (ok) {
      onDelete(table.getFilteredSelectedRowModel().rows)
      table.resetRowSelection()
    }
  }

  return (
    <>
      <ConfirmationDialog />
      <div className="w-full space-y-2">
        <div className="flex items-center flex-wrap gap-2 justify-between">
          <Input
            placeholder={`Filtrar por ${placeholder}`}
            value={
              (table.getColumn(filterKey)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(filterKey)?.setFilterValue(event.target.value)
            }
            className="lg:max-w-sm w-full h-9"
            disabled={disabled}
          />

          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap w-full lg:w-fit">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={disabled}>
                    Ações ({table.getFilteredSelectedRowModel().rows.length})
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* {!isNonExportable && (
                    <DropdownMenuItem disabled={disabled}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar selecionados
                    </DropdownMenuItem>
                  )} */}
                  <DropdownMenuItem
                    onClick={handleBulkDelete}
                    disabled={disabled}
                  >
                    {isNonReversibled ? (
                      <>
                        <Trash2 className="size-4 mr-2" />
                        Excluir selecionados
                      </>
                    ) : (
                      <>
                        <Ban className="size-4 mr-2" />
                        Bloquear selecionados
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {filters}
            <SelectFilter
              placeholder="Selecione limite"
              defaultValue={10}
              value={table.getState().pagination.pageSize}
              data={FilterOptionsPageSize.map((pageSize) => ({
                label: pageSize,
                value: pageSize,
              }))}
              onChange={(value) => {
                table.setPageSize(value)
              }}
              className="w-full min-w-32"
              isDisabled={disabled}
            />
            <SelectFilter
              placeholder="Selecione status"
              defaultValue={undefined}
              value={status}
              data={statusFilter || FilterStatus}
              onChange={onChangeStatus}
              className="w-full min-w-32"
              isDisabled={disabled}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="w-full lg:w-fit">
                <Button
                  variant="outline"
                  disabled={disabled}
                  className="flex items-center justify-between"
                >
                  Colunas <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <ScrollArea className="rounded-md border overflow-auto max-w-full min-w-full w-[273px]">
          <Table className="min-w-[900px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhum registro cadastro
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} de{' '}
            {table.getFilteredRowModel().rows.length} registro(s)
            selecionado(s).
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Voltar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Avançar
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export const DataTableLoading = () => {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center flex-wrap gap-2 justify-between">
        <Skeleton className="h-9 w-[400px] lg:max-w-sm" />
        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap w-full lg:w-fit">
          <Skeleton className="h-9 w-[130px]" />
          <Skeleton className="h-9 w-[130px]" />
          <Skeleton className="h-9 w-[130px]" />
        </div>
      </div>
      <Skeleton className="h-[300px] w-full" />
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-[20px] w-[200px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-[30px] w-[150px]" />
          <Skeleton className="h-[30px] w-[150px]" />
        </div>
      </div>
    </div>
  )
}
