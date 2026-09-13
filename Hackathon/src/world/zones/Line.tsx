import { RIGHT_WALL_X } from '../layout';
import { DepartureBoard } from '../props/DepartureBoard';
import { Poster } from '../props/street';

export function Line() {
  return (
    <group>
      <DepartureBoard title="THE LINE" position={[RIGHT_WALL_X - 0.35, 4.2, -91]} rotation={[0, -Math.PI / 2, 0]} width={10} height={4.5} rows={6} />
      <Poster word="36H" accent="red" position={[RIGHT_WALL_X - 0.05, 3, -84]} rotation={[0, -Math.PI / 2, 0]} />
      <Poster word="BUILD" accent="cyan" position={[RIGHT_WALL_X - 0.05, 3, -98]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  );
}
