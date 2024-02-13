"use client";

import * as React from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";

import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function Visitors() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const router = useRouter();

  const [opeAlert, setOpenAlert] = React.useState(false);

  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [registries, setRegistries] = React.useState([]);

  const columns = [
    {
      accessorKey: "ip",
      header: "IP Address",
      cell: ({ row }) => <div className="">{row.getValue("ip")}</div>,
    },
    {
      accessorKey: "country_name",
      header: "Country",
      cell: ({ row }) => <div className="">{row.getValue("country_name")}</div>,
    },
    {
      accessorKey: "region_name",
      header: "Region Name",
      cell: ({ row }) => <div className="">{row.getValue("region_name")}</div>,
    },
    {
      accessorKey: "city_name",
      header: "City",
      cell: ({ row }) => <div className="">{row.getValue("city_name")}</div>,
    },
    {
      accessorKey: "zip_code",
      header: "Zip Code",
      cell: ({ row }) => <div className="">{row.getValue("zip_code")}</div>,
    },
    {
      accessorKey: "as",
      header: "AS",
      cell: ({ row }) => <div className="">{row.getValue("as")}</div>,
    },
    {
      accessorKey: "date",
      header: "Created AT",
      cell: ({ row }) => <div className="">{row.getValue("date")}</div>,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => {
                console.log(row);
                router.push(`/dashboard/view/${row.original.id}`);
              }}
            >
              View All -
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: registries,
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
  });

  async function getCR() {
    setLoading(true);
    try {
      await axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/visite?link_id=${id}`, {
          headers: {
            "Content-Type": "application/json", // Set JSON content type header
            Authorization: `${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          setRegistries(response?.data?.data);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          toast(error.response?.data?.message, {
            type: "error",
          });
        });
    } catch (error) {
      setTimeout(() => {
        setGettingCr(false);
        toast(error.response?.data?.message, {
          type: "error",
        });
      }, 1000);
    }
  }

  const [creating, setCreating] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [image, setImage] = React.useState("");

  async function createCr() {
    setCreating(true);
    await axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/links`,
        {
          title: title,
          destination: destination,
          image: image,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        setCreating(false);
        toast(res?.data?.message, { type: "success" });
        getCR();
        setOpenAlert(false);
      })
      .catch((err) => {
        setCreating(false);
        toast(err.response?.data?.message, { type: "error" });
        setOpenAlert(false);
      });
  }

  React.useEffect(() => {
    getCR();
  }, []);

  return (
    <div className="hidden flex-col md:flex">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Filter title..."
            value={table?.getColumn("title")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table?.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex items-center justify-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  ?.getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
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
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {loading ? (
          <div className="text-center space-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-full mt-2" />
          </div>
        ) : (
          <ScrollArea className="h-[50vh] w-full rounded-md border">
            <Table>
              <TableHeader>
                {table?.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table?.getRowModel()?.rows?.length ? (
                  table?.getRowModel()?.rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          className="py-2 items-center justify-center"
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-20 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table?.getFilteredSelectedRowModel()?.rows?.length} of{" "}
            {table?.getFilteredRowModel()?.rows?.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table?.previousPage()}
              disabled={!table?.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table?.nextPage()}
              disabled={!table?.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={opeAlert} onOpenChange={setOpenAlert}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create New Link</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Create New Registry */}
            <div className="py-4">
              {/* Name */}
              <label className="block">
                <Label className="">Title*</Label>
                <Input
                  type="text"
                  className=""
                  placeholder="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              {/* Size */}
              <label className="block mt-5">
                <Label className="text-gray-700 dark:text-slate-400">
                  Destination URL*
                </Label>
                <Input
                  type="text"
                  placeholder="destination url"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </label>
              {/* Username */}
              {/* <label className="block mt-5">
                <Label className="text-gray-700 dark:text-slate-400">
                  Username*
                </Label>
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label> */}
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={creating}
              onClick={() => {
                createCr();
              }}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
