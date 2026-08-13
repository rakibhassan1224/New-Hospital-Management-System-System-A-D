"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";

function PatientTabsInner({ defaultTab }: { defaultTab: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    params.set("page", "1"); // Reset pagination on tab change
    router.push(`/patients?${params.toString()}`);
  };

  return (
    <Tabs value={defaultTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
        <TabsTrigger value="all">All Patients</TabsTrigger>
        <TabsTrigger value="waiting">Waiting (Today)</TabsTrigger>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="visited">Already Visited</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function PatientTabs({ defaultTab }: { defaultTab: string }) {
  return (
    <Suspense fallback={
      <Tabs value={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="all">All Patients</TabsTrigger>
          <TabsTrigger value="waiting">Waiting (Today)</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="visited">Already Visited</TabsTrigger>
        </TabsList>
      </Tabs>
    }>
      <PatientTabsInner defaultTab={defaultTab} />
    </Suspense>
  );
}
