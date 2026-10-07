import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AppLoading() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <LoadingSpinner label="Loading page..." />
    </div>
  );
}
