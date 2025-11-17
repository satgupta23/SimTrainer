// data/tracks.ts
export type TrackId = 'ra' | 'ta';
export type ScenarioId =
  | 'ra-noise-complaint'
  | 'ra-homesick'
  | 'ta-failed-midterm'
  | 'ta-extension-request';

export interface Scenario {
  id: ScenarioId;
  trackId: TrackId;
  title: string;
  shortDescription: string;
}

export interface Track {
  id: TrackId;
  name: string;
  description: string;
  scenarios: Scenario[];
}

export const tracks: Track[] = [
  {
    id: 'ra',
    name: 'RA Training',
    description:
      'Practice common residence life conversations like noise complaints and homesick residents.',
    scenarios: [
      {
        id: 'ra-noise-complaint',
        trackId: 'ra',
        title: 'Noise Complaint at 2 AM',
        shortDescription:
          'Handle a resident upset about loud neighbors late at night.',
      },
      {
        id: 'ra-homesick',
        trackId: 'ra',
        title: 'Homesick & Isolated Resident',
        shortDescription:
          'Talk with a resident who feels lonely and wants to transfer.',
      },
    ],
  },
  {
    id: 'ta',
    name: 'TA Training',
    description:
      'Practice talking with students about grades, stress, and deadlines.',
    scenarios: [
      {
        id: 'ta-failed-midterm',
        trackId: 'ta',
        title: 'Student Failed a Midterm',
        shortDescription:
          'Support a student who bombed a test and doubts their ability.',
      },
      {
        id: 'ta-extension-request',
        trackId: 'ta',
        title: 'Extension Request',
        shortDescription:
          'Navigate a tricky request for an extension on an assignment.',
      },
    ],
  },
];

export function getTrack(trackId: TrackId) {
  return tracks.find((t) => t.id === trackId);
}

export function getScenario(scenarioId: ScenarioId) {
  for (const track of tracks) {
    const found = track.scenarios.find((s) => s.id === scenarioId);
    if (found) return found;
  }
  return undefined;
}

// Flatten all scenarios so ChatPanel can look them up by id
// Flatten all scenarios so ChatPanel can look them up by id
export const SCENARIOS = tracks.flatMap((track) =>
  track.scenarios.map((scenario) => ({
    ...scenario,
    trackId: track.id,
  }))
);

