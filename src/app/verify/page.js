"use client";
import { Suspense } from "react";
import Verify from "./Verify";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Verify />
    </Suspense>
  );
}
