import { DOMAINS } from '@/config/event';
import { DOOR_Z } from '../layout';
import { RouteDoor } from '../props/RouteDoor';

export function Routes() {
  return <group>{DOMAINS.map((d) => <RouteDoor key={d.id} domain={d} z={DOOR_Z[d.id]} />)}</group>;
}
