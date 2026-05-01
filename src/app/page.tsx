'use client'

import { DragProvider } from "@/components/general/DragProvider";
import { SelectionProvider } from "@/components/general/SelectionProvider";
import JournalWriter from "@/components/journalWriter/JournalWriter";
import Landing from "@/components/magic/Landing";
import Focus from "@/components/test/Focus";
import { _wpoint } from "@/helpers/wpoint";

export default function Home() {
  const testing:string|null = null;

  //      {testing && <JournalWriter />}

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <DragProvider>
      <SelectionProvider>
      {!testing && <Landing />}
      {testing === 'focus' && <Focus />}
      </SelectionProvider>
      </DragProvider>
    </div>
  );
}
