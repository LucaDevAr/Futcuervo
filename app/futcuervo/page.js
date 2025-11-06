"use client";
import dynamic from "next/dynamic";

const FutCuervoHome = dynamic(
  () => import("@/components/futcuervo/FutCuervoHome"),
  {
    ssr: false,
  }
);

export default function FutCuervoPage() {
  return <FutCuervoHome />;
}
