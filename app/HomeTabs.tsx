'use client';
import { useState, useEffect, type ReactNode } from 'react';
import { ArrowRight, Bell } from 'lucide-react';
import NewDocumentRequest from './NewDocumentRequest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function HomeTabs({ children, canRequest }: { children: ReactNode; canRequest: boolean }) {
  const [tab, setTab] = useState('home');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!canRequest) return;
    let active = true;
    async function refresh() {
      try {
        const r = await fetch('/api/requests');
        const j: any = await r.json();
        if (active && r.ok) setCount(j.requests.filter((x: any) => JSON.parse(x.data).status === 'Submitted').length);
      } catch {}
    }
    refresh();
    const timer = setInterval(refresh, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [canRequest, tab]);

  // Document requests are only available to authorised personnel for now.
  if (!canRequest) return <>{children}</>;

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full gap-6">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3">
        <TabsList className="w-full">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="request">
            Document Requests
            {count > 0 && <Badge className="h-4 min-w-4 rounded-full px-1 text-[10px]">{count}</Badge>}
          </TabsTrigger>
        </TabsList>
        {count > 0 && tab === 'home' && (
          <button
            onClick={() => setTab('request')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary/20 bg-accent px-3 py-2 text-xs font-medium text-accent-foreground hover:bg-accent/70"
          >
            <Bell className="size-3.5" />
            {count} submitted request{count === 1 ? '' : 's'} awaiting HRPC review
            <ArrowRight className="size-3.5" />
          </button>
        )}
      </div>
      <TabsContent value="home">{children}</TabsContent>
      <TabsContent value="request" className="mx-auto w-full max-w-3xl">
        <NewDocumentRequest />
      </TabsContent>
    </Tabs>
  );
}
