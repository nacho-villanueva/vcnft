// @flow
import * as React from 'react';
import {useEffect, useState} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {apiInstance} from "@/utils/Axios";
import {ISSUER_NAME} from "@/app/manufacturer";
import {Skeleton} from "@/components/ui/skeleton";
import moment from "moment";
import {Button} from "@/components/ui/button";
import {Link, Route, Routes, useNavigate} from "react-router-dom";
import {AiFillCaretLeft} from "react-icons/ai";
import Credential from "./credential"

export type IssuedCredential = {
  _id: string,
  issuerDID: string,
  issuerName: string,
  issuedAt: Date,
  claims: Record<string, any>
  nftDidCreation: string,
  forAddress: string,
  status?: string,
}

export const columns: ColumnDef<IssuedCredential>[] = [
  {
    accessorKey: "_id",
    header: "Credential ID",
  },
  {
    accessorKey: "issuerDID",
    header: "Issuer DID",
    accessorFn: (row) => (row.issuerDID.slice(0, 15) + " ... " + row.issuerDID.slice(-4)),
  },
  {
    accessorKey: "forAddress",
    header: "For",
    accessorFn: (row) => (row.forAddress.slice(0, 6) + " ... " + row.forAddress.slice(-4)),
  },
  {
    header: "Issue Date",
    accessorFn: (row) => moment(row.issuedAt).format("MMM DD YYYY"),
  }
]


const ManufacturerStatus = () => {
  const [data, setData] = useState<IssuedCredential[]>([]);
  const [isLoading, setLoading] = useState(true);

  const [activeCredential, setActiveCredential] = useState<IssuedCredential | undefined>(undefined);
  const navigate = useNavigate();


  useEffect(() => {
    apiInstance.get(`/issuer/${ISSUER_NAME}/issue/vcnft`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleRowClick = (index: number) => {
    navigate(`/manufacturer/status/${data[index]?._id}`)
  }

  return (<Routes>
      <Route path={"/"} element={(<>
        <div className={"flex w-full justify-start px-2"}>
          <Button variant={"link"} asChild><Link to={"/manufacturer"}><AiFillCaretLeft/>Back</Link></Button>
        </div>
        <div className="container mx-auto py-10">
          <DataTable columns={columns} data={data} loading={isLoading} onRowClick={handleRowClick}/>
        </div>
      </>)}/>

      <Route path={":id"} element={<Credential issuer={ISSUER_NAME}/>}/>
    </Routes>
  )
};

export default ManufacturerStatus;


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({columns, data, loading, onRowClick}: DataTableProps<TData, TValue> & {
  loading: boolean,
  onRowClick: (index: number) => void
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
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
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
              <TableHead> </TableHead>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, i) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick(i)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                <TableCell>
                  <Button variant={"link"} onClick={() => onRowClick(i)}>View</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (!loading ?
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
              : <TableSkeletonRow columnsCount={columns.length} rowsCount={5}/>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

const TableSkeletonRow = ({columnsCount, rowsCount}: { columnsCount: number, rowsCount: number }) => {
  return (
    [...Array(rowsCount)].map((_, i) => (
      <TableRow key={i}>
        {[...Array(columnsCount)].map((_, i) => (
          <TableCell key={i}>
            <Skeleton className={"h-4 w-full"}/>
          </TableCell>
        ))}
      </TableRow>
    ))
  )
}
