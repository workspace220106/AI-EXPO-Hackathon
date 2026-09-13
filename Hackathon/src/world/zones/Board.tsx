import { RIGHT_WALL_X } from '../layout';
import { DepartureBoard } from '../props/DepartureBoard';

export function Board() {
  return (
    <group>
      <DepartureBoard title="THE RUNNERS" live position={[RIGHT_WALL_X - 0.35, 4.6, -111]} rotation={[0, -Math.PI / 2, 0]} width={12} height={5.5} rows={6} />
    </group>
  );
}
