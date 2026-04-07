import { Suspense } from "react";
import BookingWaiting from "./BookingWaiting";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingWaiting />
    </Suspense>
  );
}
