/*eslint-disable*/
'use client';

import MainChart from '@/components/dashboard/main/cards/MainChart';
import MainDashboardTable from '@/components/dashboard/main/cards/MainDashboardTable';
import DashboardLayout from '@/components/layout';
import tableDataUserReports from '@/variables/tableDataUserReports';
import { User } from '@supabase/supabase-js';
interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null | any;
}

export default function Settings(props: Props) {
  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Writing Dashboard"
      description="Track your writing progress and feedback"
    >
      <div className="min-h-screen w-full">
        <div className="mb-5 flex gap-5 flex-col xl:flex-row w-full">
          <MainChart />
        </div>
        <div className="w-full rounded-lg">
          <MainDashboardTable user={props.user} />
        </div>
      </div>
    </DashboardLayout>
  );
}
