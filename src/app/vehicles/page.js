"use client";
import { Suspense } from "react";
import VehicleList from "./VehicleList";

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VehicleList />
    </Suspense>
  );
}
