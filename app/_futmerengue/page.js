"use client";
import dynamic from "next/dynamic";

const FutMerengueHome = dynamic(
  () => import("@/components/futmerengue/FutMerengueHome"),
  { ssr: false }
);

export default function FutMerenguePage() {
  return <FutMerengueHome />;
}
