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
  claims: string,
  nftDidCreation: string,
  forAddress: string,
  status?: string,
}

export const columns: ColumnDef<IssuedCredential>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: (row ) => {
      switch (row.renderValue()) {
        case "ISSUED":
          return <span className={"text-green-500"}>Issued</span>
        case "CLAIMED":
          return <span className={"text-blue-500"}>Claimed</span>
        case "PENDING":
          return <span className={"text-yellow-500"}>Pending</span>
        case "FAILED":
          return <span className={"text-red-500"}>Failed</span>
      }
    }
  },
  {
    accessorKey: "_id",
    header: "Credential ID",
    accessorFn: (row) => row._id.slice(0, 4) + " ... " + row._id.slice(-4),
  },
  {
    accessorKey: "issuerDID",
    header: "Issuer DID",
    accessorFn: (row) => (row.issuerDID.slice(0, 15) + " ... " + row.issuerDID.slice(-4)),
  },
  {
    header: "Issue Date",
    accessorFn: (row) => moment(row.issuedAt).format("MMM DD YYYY"),
  },
  {
    accessorKey: "claims",
    header: "Claims",
    cell: (row) => {
      const c = Object.entries(JSON.parse(row.getValue() as string ?? "{}"))
      return <pre className={"text-xs"}>
        {c.map(([key, value]) => (
          <div key={key}>
            <span className={"capitalize"}>{key}:</span>&nbsp;
            <b>{!!value && JSON.stringify(value)}</b></div>
        ))}
      </pre>
    },
    // accessorFn: (row) => Object.entries(JSON.parse(row.claims)).map(a => a.join(": ")).join("\n"),
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
                className={"cursor-pointer"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} style={{whiteSpace: "pre-wrap"}}>
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
