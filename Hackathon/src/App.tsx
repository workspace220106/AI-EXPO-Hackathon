export function Shell() {
  return (
    <div className="relative z-10 min-h-dvh">
      <header className="fixed left-4 top-4 z-20">
        <span className="font-display text-2xl text-navy">AI EXPO</span>
        <span className="block font-ui text-xs font-bold tracking-widest text-navy">// RUN THE HACKATHON</span>
      </header>
    </div>
  );
}

export default function App() {
  return <Shell />;
}
