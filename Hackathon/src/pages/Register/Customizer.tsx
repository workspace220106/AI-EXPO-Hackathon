import { useEffect, useState } from 'react';
import type { AvatarConfig } from '@/api/types';
import { validateRunnerName } from '@/lib/validation';
import { useWorld } from '@/store/world';
import type { PaletteName } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Chip } from '@/ui/Chip';
import { Field } from '@/ui/Field';
import { Panel } from '@/ui/Panel';
import { applyOption, currentValue, PART_GROUPS } from './avatarOptions';

export interface CustomizerProps {
  title: string;
  subtitle: string;
  value: AvatarConfig;
  onChange(next: AvatarConfig): void;
  onSave(): void | Promise<void>;
  saving?: boolean;
  saveLabel: string;
}

export function Customizer({ title, subtitle, value, onChange, onSave, saving, saveLabel }: CustomizerProps) {
  const [nameError, setNameError] = useState<string>();

  useEffect(() => { useWorld.getState().setLockerAvatar(value); }, [value]);
  useEffect(() => () => useWorld.getState().setLockerAvatar(null), []);

  const pick = (key: (typeof PART_GROUPS)[number]['key'], v: string) => {
    onChange(applyOption(value, key, v));
    useWorld.getState().bumpLockerCelebrate();
    useWorld.getState().emit({ type: 'burst', zone: 'locker', color: 'cyan' });
  };
  const glance = () => useWorld.getState().emit({ type: 'look', zone: 'locker' });

  const save = () => {
    const err = validateRunnerName(value.name);
    setNameError(err);
    if (!err) void onSave();
  };

  return (
    <Panel title={title} className="w-full max-w-lg max-h-[88dvh] overflow-y-auto">
      <p className="-mt-2 mb-4 font-ui text-sm font-bold">{subtitle}</p>
      <Field label="RUNNER NAME" name="runnerName" zone="locker" value={value.name} maxLength={16}
        onChange={(e) => onChange({ ...value, name: e.target.value.toUpperCase() })} error={nameError} hint="2–16 letters, digits or spaces — printed on your Hack Pass" />
      {PART_GROUPS.map((g) => (
        <fieldset key={g.key} className="mb-4">
          <legend className="mb-2 font-display text-xs tracking-widest">{g.label}</legend>
          <div className="flex flex-wrap gap-2">
            {g.options.map((o) => (
              <Chip key={o.value} selected={currentValue(value, g.key) === o.value} swatch={g.swatch ? (o.value as PaletteName) : undefined}
                onClick={() => pick(g.key, o.value)} onMouseEnter={glance} title={o.label}>
                {g.swatch ? '' : o.label}
              </Chip>
            ))}
          </div>
        </fieldset>
      ))}
      <ArcadeButton size="lg" className="w-full" disabled={saving} onClick={save}>{saveLabel}</ArcadeButton>
    </Panel>
  );
}
