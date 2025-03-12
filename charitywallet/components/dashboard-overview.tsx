import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface OverviewSectionProps {
  totalRevenue: number;
  donationCount: number;
  activeDonors: number;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  totalRevenue,
  donationCount,
  activeDonors,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalRevenue.toLocaleString()}
          </div>
        </CardContent>
      </Card> */}
      <Card>
        <CardHeader>
          <CardTitle>Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{donationCount}</div>
        </CardContent>
      </Card>
      {/* <Card>
        <CardHeader>
          <CardTitle>Active Donors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeDonors}</div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default OverviewSection;
