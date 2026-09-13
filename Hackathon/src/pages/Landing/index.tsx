import type { ComponentType } from 'react';
import { PinnedRunner } from '@/ui/PinnedRunner';
import { CheckinSection } from './CheckinSection';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { LineSection } from './LineSection';
import { RoutesSection } from './RoutesSection';
import { RunnersSection } from './RunnersSection';
import { LANDING_SECTIONS } from './sections';
import { Section } from './Section';
import { SkipIntro } from './SkipIntro';

const BODY: Record<string, ComponentType> = {
  hero: Hero, domains: RoutesSection, challenge: LineSection, leaderboard: RunnersSection, checkin: CheckinSection, footer: Footer,
};

export default function Landing() {
  return (
    <main id="content" className="relative z-10 snap-y snap-mandatory md:snap-none">
      <SkipIntro />
      <PinnedRunner />
      {LANDING_SECTIONS.map((s, i) => {
        const Body = BODY[s.id];
        return (
          <Section key={s.id} id={s.id} align={i % 2 ? 'end' : 'start'} wide={s.id === 'challenge'}>
            <Body />
          </Section>
        );
      })}
    </main>
  );
}
