import { createMockApi, type MockApi } from './mock';

/** The app-wide API. Swap `createMockApi` for a real implementation of `HackathonApi` later. */
export const api: MockApi = createMockApi();
export type { HackathonApi } from './types';
