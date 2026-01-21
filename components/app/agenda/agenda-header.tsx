"use client";

import { format, addDays } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function AgendaHeader({ date }: { date: Date }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateDate = (nextDate: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", format(nextDate, "yyyy-MM-dd"));
    router.replace(`/app/agenda?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          Agenda
        </p>
        <h1 className="text-xl font-semibold">
          {format(date, "EEEE, d MMMM")}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateDate(addDays(date, -1))}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateDate(new Date())}
        >
          Hoy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateDate(addDays(date, 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
