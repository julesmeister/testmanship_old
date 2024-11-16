import CardMenu from '@/components/card/CardMenu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PaginationState,
  createColumnHelper,
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender
} from '@tanstack/react-table';
import React from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type RowObj = {
  checked?: string;
  email: string;
  provider: string;
  created: string;
  lastsigned: string;
  uuid: string;
  menu?: string;
};

type Challenge = {
  id: string;
  title: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  performance: number;
  paragraphs: number;
  completedAt: Date;
  timeSpent: number;
  wordCount: number;
  feedback: string;
};

const challenges: Challenge[] = [
  {
    id: "1",
    title: "IELTS Task 2: Technology Impact",
    difficulty: "Hard",
    performance: 8.5,
    paragraphs: 5,
    completedAt: new Date("2024-01-15T14:30:00"),
    timeSpent: 45,
    wordCount: 320,
    feedback: "Excellent argument structure",
  },
  {
    id: "2",
    title: "TOEFL: Education Systems",
    difficulty: "Moderate",
    performance: 7.5,
    paragraphs: 4,
    completedAt: new Date("2024-01-14T10:15:00"),
    timeSpent: 35,
    wordCount: 285,
    feedback: "Good ideas, needs better transitions",
  },
  {
    id: "3",
    title: "General Writing: Climate Change",
    difficulty: "Easy",
    performance: 9.0,
    paragraphs: 6,
    completedAt: new Date("2024-01-13T16:45:00"),
    timeSpent: 40,
    wordCount: 350,
    feedback: "Outstanding vocabulary usage",
  }
];

const getDifficultyColor = (difficulty: Challenge["difficulty"]) => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    case "Moderate":
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    case "Hard":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
  }
};

const getPerformanceColor = (score: number) => {
  if (score >= 8.5) return "text-green-500";
  if (score >= 7.0) return "text-yellow-500";
  return "text-red-500";
};

function CheckTable(props: { tableData: any }) {
  const { tableData } = props;
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  let defaultData = tableData;
  const [globalFilter, setGlobalFilter] = React.useState('');
  const createPages = (count: number) => {
    let arrPageCount = [];

    for (let i = 1; i <= count; i++) {
      arrPageCount.push(i);
    }

    return arrPageCount;
  };
  const columns = [
    columnHelper.accessor('checked', {
      id: 'checked',
      header: () => (
        <div className="flex max-w-max items-center">
          <Checkbox />
        </div>
      ),
      cell: (info: any) => (
        <div className="flex max-w-max items-center">
          <Checkbox defaultChecked={info.getValue()[1]} />
        </div>
      )
    }),
    columnHelper.accessor('email', {
      id: 'email',
      header: () => (
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          EMAIL ADDRESS
        </p>
      ),
      cell: (info) => (
        <p className="text-sm font-medium text-zinc-950 dark:text-white">
          {info.getValue()}
        </p>
      )
    }),
    columnHelper.accessor('provider', {
      id: 'provider',
      header: () => (
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          PROVIDER
        </p>
      ),
      cell: (info: any) => (
        <div className="flex w-full items-center gap-[14px]">
          <p className="text-sm font-medium text-zinc-950 dark:text-white">
            {info.getValue()}
          </p>
        </div>
      )
    }),
    columnHelper.accessor('created', {
      id: 'created',
      header: () => (
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          CREATED
        </p>
      ),
      cell: (info: any) => (
        <div className="flex w-full items-center gap-[14px]">
          <p className="text-sm font-medium text-zinc-950 dark:text-white">
            {info.getValue()}
          </p>
        </div>
      )
    }),
    columnHelper.accessor('lastsigned', {
      id: 'lastsigned',
      header: () => (
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          LAST SIGN IN
        </p>
      ),
      cell: (info) => (
        <p className="text-sm font-medium text-zinc-950 dark:text-white">
          {info.getValue()}
        </p>
      )
    }),
    columnHelper.accessor('uuid', {
      id: 'uuid',
      header: () => (
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          USER UID
        </p>
      ),
      cell: (info) => (
        <p className="text-sm font-medium text-zinc-950 dark:text-white">
          {info.getValue()}
        </p>
      )
    }),
    columnHelper.accessor('menu', {
      id: 'menu',
      header: () => (
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400"></p>
      ),
      cell: (info) => <CardMenu vertical={true} />
    })
  ]; // eslint-disable-next-line
  const [data, setData] = React.useState(() => [...defaultData]);
  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 11
  });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize
    }),
    [pageIndex, pageSize]
  );
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
      pagination
    },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false
  });

  return (
    <Card
      className={
        'h-full w-full border-zinc-200 p-0 dark:border-zinc-800 sm:overflow-auto'
      }
    >
      <div className="overflow-x-scroll xl:overflow-x-hidden">
        <Table className="w-full">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableHeader
              key={headerGroup.id}
              className="border-b-[1px] border-zinc-200 p-6 dark:border-zinc-800"
            >
              <tr className="dark:border-zinc-800">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: '',
                        desc: ''
                      }[header.column.getIsSorted() as string] ?? null}
                    </TableHead>
                  );
                })}{' '}
              </tr>
            </TableHeader>
          ))}
          <TableBody>
            {table
              .getRowModel()
              .rows.slice(0, 7)
              .map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    className="px-6 dark:hover:bg-gray-900"
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        {/* pagination */}
        <div className="mt-2 flex h-20 w-full items-center justify-between px-6">
          {/* left side */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Showing 6 rows per page
            </p>
          </div>
          {/* right side */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`flex items-center justify-center rounded-lg bg-transparent p-2 text-lg text-zinc-950 transition duration-200 hover:bg-transparent active:bg-transparent dark:text-white dark:hover:bg-transparent dark:active:bg-transparent`}
            >
              <MdChevronLeft />
            </Button>

            {/* {createPages(table.getPageCount()).map((pageNumber, index) => {
       return (
        <Button
         className={`font-mediumflex p-0 items-center justify-center rounded-lg p-2 text-sm transition duration-200 ${
          pageNumber === pageIndex + 1
           ? ''
           : 'border border-zinc-200 bg-[transparent] dark:border-zinc-800 dark:text-white'
         }`}
         onClick={() => table.setPageIndex(pageNumber - 1)}
         key={index}
        >
         {pageNumber}
        </Button>
       );
      })} */}
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`flex min-w-[34px] items-center justify-center rounded-lg bg-transparent p-2 text-lg text-zinc-950 transition duration-200 hover:bg-transparent active:bg-transparent dark:text-white dark:hover:bg-transparent dark:active:bg-transparent`}
            >
              <MdChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function MainDashboardTable() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Recent Writing Challenges
        </h2>
        <Badge variant="outline" className="text-xs">
          Last 30 days
        </Badge>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Challenge</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Performance</TableHead>
              <TableHead className="text-right">Paragraphs</TableHead>
              <TableHead className="text-right">Words</TableHead>
              <TableHead className="text-right">Time Spent</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challenges.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {challenge.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {challenge.feedback}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getDifficultyColor(challenge.difficulty)}
                  >
                    {challenge.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-medium ${getPerformanceColor(challenge.performance)}`}>
                    {challenge.performance.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {challenge.paragraphs}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {challenge.wordCount}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {challenge.timeSpent} min
                  </span>
                </TableCell>
                <TableCell className="text-right text-zinc-500 dark:text-zinc-400">
                  {format(challenge.completedAt, "MMM d, h:mm a")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

const columnHelper = createColumnHelper<RowObj>();
