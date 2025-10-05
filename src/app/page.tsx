import JournalWriter from "@/components/journalWriter/JournalWriter";
import Focus from "@/components/test/Focus";
import Scroller from "@/components/test/Scroller";

export default function Home() {
  const testing:string|null = "scroller";

  return (
    <div className="flex min-h-screen flex-col items-center justify-between">
      {!testing && <JournalWriter />}
      {testing === 'focus' && <Focus />}
      {testing === 'scroller' && <Scroller x={100} y={100} width={100} height={200}/>}
    </div>
  );
}
