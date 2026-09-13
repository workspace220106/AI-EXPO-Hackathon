import { ArcadeButton } from '@/ui/ArcadeButton';
import { Panel } from '@/ui/Panel';

export default function NotFound() {
  return (
    <main id="content" className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-5">
      <Panel title="WRONG PLATFORM" tone="navy" className="max-w-md">
        <p className="font-ui text-sm">This line does not exist, runner. The train home leaves now.</p>
        <div className="mt-5"><ArcadeButton to="/">TRAIN BACK HOME</ArcadeButton></div>
      </Panel>
    </main>
  );
}
