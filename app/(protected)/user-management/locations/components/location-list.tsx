'use client';

import { useMemo, useState } from 'react';
import { redirect } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronRight, Plus, Search, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable } from '@/components/ui/card';
import {
  DataGrid,
  DataGridApiFetchParams,
  DataGridApiResponse,
} from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import LocationAddDialog from './location-add-dialog';
import { AvatarGroup } from '@/app/components/partials/common/avatar-group';

// --- Types ---
export interface LocationUser {
  id: string;
  userId: string;
  roleId: string;
  isPrimary: boolean;
  isCurrent: boolean;
  user: { id: string; name: string; email: string };
  role: { id: string; name: string };
}
export interface LocationChild {
  id: string;
  name: string;
}
export interface Location {
  id: string;
  name: string;
  parent?: { id: string; name: string } | null;
  children?: LocationChild[];
  users?: LocationUser[];
}

const fetchLocations = async ({
  pageIndex,
  pageSize,
  sorting,
  searchQuery,
}: DataGridApiFetchParams): Promise<DataGridApiResponse<Location>> => {
  const sortField = sorting?.[0]?.id || '';
  const sortDirection = sorting?.[0]?.desc ? 'desc' : 'asc';

  const params = new URLSearchParams({
    page: String(pageIndex + 1),
    limit: String(pageSize),
    ...(sortField ? { sort: sortField, dir: sortDirection } : {}),
    ...(searchQuery ? { query: searchQuery } : {}),
  });

  const response = await apiFetch(
    `/api/user-management/locations?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Unable to fetch locations.');
  }
  return response.json();
};

const LocationsList = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addLocationOpen, setAddLocationOpen] = useState(false);

  // Data fetching
  const { data, isLoading } = useQuery({
    queryKey: ['locations', pagination, sorting, searchQuery],
    queryFn: () =>
      fetchLocations({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        searchQuery,
      }),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Columns
  const columns = useMemo<ColumnDef<Location>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader title="Location" visibility={true} column={column} />
        ),
        cell: ({ row }) => <div className="font-medium text-sm">{row.original.name}</div>,
        size: 250,
        meta: { headerTitle: 'Location Name', skeleton: <Skeleton className="h-4 w-40" /> },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: 'parent',
        header: ({ column }) => (
          <DataGridColumnHeader title="Parent" visibility={true} column={column} />
        ),
        cell: ({ row }) =>
          row.original.parent ? (
            <span className="text-sm text-muted-foreground">{row.original.parent.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
        size: 200,
        meta: { headerTitle: 'Parent Location', skeleton: <Skeleton className="h-4 w-40" /> },
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: 'children',
        header: ({ column }) => (
          <DataGridColumnHeader title="Children" visibility={true} column={column} />
        ),
        cell: ({ row }) =>
          row.original.children && row.original.children.length > 0 ? (
            <span>
              {row.original.children.map((child: LocationChild) => child.name).join(', ')}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
        size: 200,
        meta: { headerTitle: 'Children', skeleton: <Skeleton className="h-4 w-40" /> },
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: 'users',
        id: 'users',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Users"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const users = row.original.users ?? [];
          if (users.length === 0)
            return <span className="text-muted-foreground">None</span>;

          // Convert users to what AvatarGroup expects
          const avatarGroup = users.map((ul) => ({
            path: '', // If you have avatar URLs
            fallback:
              ul.user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || ul.user?.email[0]?.toUpperCase() || 'U',
          }));

          return <AvatarGroup group={avatarGroup} size="size-7" />;
        },
        size: 180,
        meta: {
          headerTitle: 'Users',
          skeleton: <Skeleton className="h-6 w-[75px]" />,
        },
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: 'actions',
        header: '',
        cell: () => (
          <ChevronRight className="text-muted-foreground/70 size-3.5" />
        ),
        meta: { skeleton: <Skeleton className="size-4" /> },
        size: 40,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
      },
    ],
    []
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  // Table setup
  const table = useReactTable({
    columns,
    data: data?.data || [],
    pageCount: Math.ceil((data?.pagination.total || 0) / pagination.pageSize),
    getRowId: (row: Location) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  // Row click (optional: to location details page)
  const handleRowClick = (row: Location) => {
    redirect(`/user-management/locations/${row.id}`);
  };

  // Toolbar for search/add
  const DataGridToolbar = () => {
    const [inputValue, setInputValue] = useState(searchQuery);

    const handleSearch = () => {
      setSearchQuery(inputValue);
      setPagination({ ...pagination, pageIndex: 0 });
    };

    return (
      <CardHeader className="flex-col flex-wrap sm:flex-row items-stretch sm:items-center py-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search locations"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
              className="ps-9 w-full sm:40 md:w-64"
            />
            {inputValue.length > 0 && (
              <Button
                mode="icon"
                variant="dim"
                className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => {
                  setInputValue('');
                  setSearchQuery('');
                }}
              >
                <X />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button
            disabled={isLoading}
            onClick={() => setAddLocationOpen(true)}
          >
            <Plus />
            Add location
          </Button>
        </div>
      </CardHeader>
    );
  };

  return (
    <>
      <DataGrid
        table={table}
        recordCount={data?.pagination.total || 0}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        tableLayout={{
          columnsResizable: true,
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
        }}
        tableClassNames={{
          edgeCell: 'px-5',
        }}
      >
        <LocationAddDialog open={addLocationOpen} closeDialog={() => setAddLocationOpen(false)} />
        <Card>
          <DataGridToolbar />
          <CardTable>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>
    </>
  );
};

export default LocationsList;
