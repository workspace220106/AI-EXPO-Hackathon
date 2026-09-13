import { ArcadeButton } from '@/ui/ArcadeButton';

export function CheckinSection() {
  return (
    <div className="pointer-auto">
      <p className="font-display text-xs tracking-[0.3em] text-navy">PLATFORM 9 · GATES OPEN</p>
      <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">RUNNER CHECK-IN</h2>
      <p className="mt-3 max-w-md font-ui text-sm font-bold text-navy">The line is open. Create your runner, pick a route, build your crew, and grab your Hack Pass.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <ArcadeButton id="checkin-cta" size="lg" to="/register/identity">CREATE YOUR RUNNER</ArcadeButton>
        <ArcadeButton size="lg" variant="secondary" to="/signin">SIGN IN</ArcadeButton>
      </div>
    </div>
  );
}
