'use client';
import JournalWriterCanvas from '@/components/JournalWriterCanvas';
import { useRef } from 'react';

export default function JournalWriter({}) {
  const sandbox = useRef<SVGSVGElement>(null);
  
  return (
    <>
      <JournalWriterCanvas/>
    </>
  );
}