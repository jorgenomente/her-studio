"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Branch = {
  id: string;
  name: string;
};

export function BranchSelector({
  branches,
  activeBranchId,
  onSelectBranch,
}: {
  branches: Branch[];
  activeBranchId: string | null;
  onSelectBranch: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeBranch = useMemo(() => {
    return branches.find((branch) => branch.id === activeBranchId) ?? null;
  }, [branches, activeBranchId]);

  useEffect(() => {
    if (activeBranchId) {
      localStorage.setItem("hs_branch_id", activeBranchId);
    }
  }, [activeBranchId]);

  const handleSelect = (branchId: string) => {
    const formData = new FormData();
    formData.set("branch_id", branchId);

    startTransition(async () => {
      await onSelectBranch(formData);
      localStorage.setItem("hs_branch_id", branchId);
      router.refresh();
    });
  };

  if (branches.length === 0) {
    return (
      <Button size="sm" variant="outline" disabled>
        No branches
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={isPending}>
          {activeBranch ? activeBranch.name : "Select branch"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => handleSelect(branch.id)}
          >
            {branch.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
