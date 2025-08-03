import JournalWriter from "@/components/JournalWriter";
import Focus from "@/components/test/Focus";

export default function Home() {
  const testing = false;

  return (
    <div className="flex min-h-screen flex-col items-center justify-between">
      {!testing && <JournalWriter />}
      {testing && <Focus />}
    </div>
  );
}
