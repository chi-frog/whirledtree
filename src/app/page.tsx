'use client'

import { CardRepoProvider } from "@/components/general/CardRepoProvider";
import { DragProvider } from "@/components/general/DragProvider";
import { SelectionProvider } from "@/components/general/SelectionProvider";
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
      <CardRepoProvider>
      {!testing && <Landing />}
      {testing === 'focus' && <Focus />}
      </CardRepoProvider>
      </SelectionProvider>
      </DragProvider>
    </div>
  );
}
