"use client";
import { Suspense } from "react";

import Services from "../services";

export default function Page() {
  return;
  <Suspense
    fallback={
      <div className="min-h-[200vh] pt-20 flex items-center justify-center">
        Loading...
      </div>
    }
  >
    <Services />
    <h1> hi</h1>
  </Suspense>;
}
