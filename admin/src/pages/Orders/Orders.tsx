import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { getAllUsers } from '../../services/userService';
import { getAllShops } from '../../services/shopService';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Order } from '@yaqiin/shared/types/order';
import { createOrder, deleteOrder, getOrders, OrderListResponse, updateOrder } from '../../services/orderService';
import OrderFormModal from './components/OrderFormModal';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, getSortedRowModel, getFilteredRowModel, SortingState } from '@tanstack/react-table';

const Orders: React.FC = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const { data: ordersData, isLoading, isError } = useQuery<OrderListResponse>({
    queryKey: ['orders', page, limit],
    queryFn: () => getOrders(page, limit),
  });

  const orders = ordersData?.data || [];
  const totalPages = ordersData?.meta?.totalPages || 1;

  const queryClient = useQueryClient();
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      setDrawerOpen(false);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      setEditOrder(null);
      setDrawerOpen(false);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: getAllUsers,
  });
  const { data: shops, isLoading: loadingShops } = useQuery({
    queryKey: ['shops', 'all'],
    queryFn: getAllShops,
  });

  // Table columns definition for react-table
  const columns = React.useMemo<ColumnDef<Order, any>[]>(() => [
    {
      header: 'Order #',
      accessorKey: 'orderNumber',
      cell: info => info.getValue(),
      enableSorting: true,
      filterFn: (row, columnId, value) => String(row.getValue(columnId)).toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      header: 'Customer',
      accessorKey: 'customerId',
      cell: info => {
        if (loadingUsers) return 'Loading...';
        const user = users?.find((u: any) => u._id === info.getValue());
        return user ? `${user.firstName} ${user.lastName}` : info.getValue();
      },
      enableSorting: true,
      filterFn: (row, columnId, value) => {
        const user = users?.find((u: any) => u._id === row.getValue(columnId));
        const name = user ? `${user.firstName} ${user.lastName}` : row.getValue(columnId);
        return String(name).toLowerCase().includes(String(value).toLowerCase());
      },
    },
    {
      header: 'Shop',
      accessorKey: 'shopId',
      cell: info => {
        if (loadingShops) return 'Loading...';
        const shop = shops?.find((s: any) => s._id === info.getValue());
        return shop ? shop.name : info.getValue();
      },
      enableSorting: true,
      filterFn: (row, columnId, value) => {
        const shop = shops?.find((s: any) => s._id === row.getValue(columnId));
        const name = shop ? shop.name : row.getValue(columnId);
        return String(name).toLowerCase().includes(String(value).toLowerCase());
      },
    },
    {
      header: 'Total',
      accessorKey: 'pricing.total',
      cell: info => info.row.original.pricing.total,
      enableSorting: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: info => {
        const status = info.getValue();
        let badgeClass = 'bg-gray-700 text-gray-300';
        if (status === 'created') badgeClass = 'bg-yellow-900 text-yellow-300';
        else if (status === 'operator_confirmed') badgeClass = 'bg-blue-900 text-blue-300';
        else if (status === 'packing') badgeClass = 'bg-purple-900 text-purple-300';
        else if (status === 'packed') badgeClass = 'bg-indigo-900 text-indigo-300';
        else if (status === 'courier_picked') badgeClass = 'bg-orange-900 text-orange-300';
        else if (status === 'delivered') badgeClass = 'bg-green-900 text-green-300';
        else if (status === 'paid') badgeClass = 'bg-green-700 text-green-200';
        else if ([
          'rejected_by_shop',
          'rejected_by_courier',
          'cancelled_by_client',
        ].includes(status)) badgeClass = 'bg-red-900 text-red-300';
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeClass}`}>{status}</span>
        );
      },
      enableSorting: true,
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: info => new Date(info.getValue()).toLocaleDateString(),
      enableSorting: true,
    },
    {
      header: 'Time',
      id: 'createdTime',
      accessorFn: row => row.createdAt,
      cell: info => new Date(info.getValue()).toLocaleTimeString(),
      enableSorting: true,
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: info => (
        <div className="flex gap-3 justify-center">
          <button className="hover:text-blue-400" title="Edit" onClick={() => { setEditOrder(info.row.original); setDrawerOpen(true); }}>
            <Icon icon="mdi:pencil" width={18} height={18} />
          </button>
          <button className="hover:text-red-400" title="Delete" onClick={() => setDeleteTarget(info.row.original)}>
            <Icon icon="mdi:delete" width={18} height={18} />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ], [users, shops, loadingUsers, loadingShops]);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: false,
    pageCount: totalPages,
    state: {
      sorting,
      globalFilter,
      // columnFilters removed to prevent infinite loop
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    // onColumnFiltersChange removed
  });

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          onClick={() => setDrawerOpen(true)}
        >
          <Icon icon="mdi:plus" className="inline-block mr-2" /> Add Order
        </button>
      </div>
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input
          className="bg-[#232b42] text-white px-3 py-2 rounded"
          placeholder="Filter Order #"
          value={String(table.getColumn('orderNumber')?.getFilterValue() ?? '')}
          onChange={e => table.getColumn('orderNumber')?.setFilterValue(e.target.value)}
        />
        <input
          className="bg-[#232b42] text-white px-3 py-2 rounded"
          placeholder="Filter Customer"
          value={String(table.getColumn('customerId')?.getFilterValue() ?? '')}
          onChange={e => table.getColumn('customerId')?.setFilterValue(e.target.value)}
        />
        <input
          className="bg-[#232b42] text-white px-3 py-2 rounded"
          placeholder="Filter Shop"
          value={String(table.getColumn('shopId')?.getFilterValue() ?? '')}
          onChange={e => table.getColumn('shopId')?.setFilterValue(e.target.value)}
        />
      </div>
      <div className="bg-[#232b42] rounded-xl overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-[#2e3650]">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="py-3 px-4 cursor-pointer select-none" onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="ml-1">
                        {header.column.getIsSorted() === 'asc' ? '▲' : header.column.getIsSorted() === 'desc' ? '▼' : ''}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columns.length} className="text-center py-8">Loading...</td></tr>
            ) : isError ? (
              <tr><td colSpan={columns.length} className="text-center py-8 text-red-400">Failed to load orders.</td></tr>
            ) : !orders?.length ? (
              <tr><td colSpan={columns.length} className="text-center py-16 text-gray-400">
                <div className="flex flex-col items-center">
                  <Icon icon="mdi:package-variant" className="text-5xl mb-4" />
                  <div className="text-lg font-medium">No orders found.</div>
                  <div className="text-sm">Click <span className="font-semibold">Add Order</span> to create your first order.</div>
                </div>
              </td></tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-[#2e3650] hover:bg-[#202840] transition">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select
            className="bg-[#232b42] text-white px-2 py-1 rounded"
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >{'<<'}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >{'<'}</button>
          <span className="mx-2">{page} / {totalPages}</span>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >{'>'}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >{'>>'}</button>
        </div>
      </div>
      {isDrawerOpen && (
        <OrderFormModal
          order={editOrder || undefined}
          onClose={() => { setDrawerOpen(false); setEditOrder(null); }}
          onSubmit={(values) => {
            if (editOrder) {
              updateOrderMutation.mutate({ ...editOrder, ...values });
            } else {
              createOrderMutation.mutate(values);
            }
          }}
          loading={createOrderMutation.isPending || updateOrderMutation.isPending}
          error={createOrderMutation.isError ? (createOrderMutation.error as any)?.message : updateOrderMutation.isError ? (updateOrderMutation.error as any)?.message : null}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Order"
          description="Are you sure you want to delete this order? This action cannot be undone."
          loading={deleteOrderMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteOrderMutation.mutate(deleteTarget._id)}
        />
      )}
    </div>
  );
};

export default Orders; 