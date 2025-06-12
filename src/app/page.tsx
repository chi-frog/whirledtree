import JournalWriter from "@/components/JournalWriter";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between">
      <JournalWriter />
    </div>
  );
}
