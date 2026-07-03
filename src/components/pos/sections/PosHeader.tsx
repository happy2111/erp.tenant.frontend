'use client'

import { PosSetupFields } from './PosSetupFields';

export function PosHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-2xl border-b border-border/40">
      <div className="pb-2">
        <PosSetupFields layout="header" showReset />
      </div>
    </header>
  );
}
