// data/tracks.ts

export type TrackId = 'ra' | 'ta';

export type ScenarioId =
  | 'ra-noise-complaint'
  | 'ra-homesick'
  | 'ta-failed-midterm'
  | 'ta-extension-request';

export type Scenario = {
  id: ScenarioId;
  trackId: TrackId;
  title: string;
  shortDescription: string;
  openingLine: string;
};

export type Track = {
  id: TrackId;
  name: string;
  description: string;
  scenarios: Scenario[];
};

export const tracks: Track[] = [
  {
    id: 'ra',
    name: 'RA track',
    description: 'Practice challenging conversations that resident assistants commonly face.',
    scenarios: [
      {
        id: 'ra-noise-complaint',
        trackId: 'ra',
        title: 'Noise Complaint on a Weeknight',
        shortDescription:
          'A resident is frustrated about loud neighbors and not being able to sleep.',
        openingLine:
          "Hi, I’m really at my limit with the noise on my floor. I’ve got an exam tomorrow and I haven’t been able to sleep.",
      },
      {
        id: 'ra-homesick',
        trackId: 'ra',
        title: 'Homesick First-Year',
        shortDescription:
          'A first-year student is feeling lonely, overwhelmed, and misses home a lot.',
        openingLine:
          "It’s only been a few weeks since school started and I already feel so overwhelmed and homesick. I’m not sure I belong here.",
      },
    ],
  },
  {
    id: 'ta',
    name: 'TA track',
    description: 'Practice conversations around grades, extensions, and academic support.',
    scenarios: [
      {
        id: 'ta-failed-midterm',
        trackId: 'ta',
        title: 'Student Upset About Failed Midterm',
        shortDescription:
          'A student is discouraged after doing poorly on a midterm exam.',
        openingLine:
          "Hi, I just saw my midterm grade on Canvas and I honestly don’t know how I’m supposed to pass this class now.",
      },
      {
        id: 'ta-extension-request',
        trackId: 'ta',
        title: 'Last-Minute Extension Request',
        shortDescription:
          'A student is asking for an extension very close to the deadline.',
        openingLine:
          "I know the assignment is due tonight, but a lot of stuff came up this week. Is there any way I could get an extension?",
      },
    ],
  },
];

export function getTrack(id: TrackId) {
  return tracks.find((t) => t.id === id);
}

export function getScenario(id: ScenarioId): Scenario | undefined {
  for (const track of tracks) {
    const found = track.scenarios.find((s) => s.id === id);
    if (found) return found;
  }
  return undefined;
}

// Flat list if you ever need it
export const SCENARIOS: Scenario[] = tracks.flatMap((t) => t.scenarios);
