// data/tracks.ts

export type TrackId = 'ra' | 'ta';

export type ScenarioId =
  | 'ra-noise-complaint'
  | 'ra-homesick'
  | 'ra-roommate-conflict'
  | 'ra-guest-policy-violation'
  | 'ra-cleanliness-dispute'
  | 'ra-wellness-check-in'
  | 'ra-party-incident-followup'
  | 'ra-maintenance-delay'
  | 'ra-cultural-tension'
  | 'ra-fire-alarm-fatigue'
  | 'ra-food-allergy-concern'
  | 'ta-failed-midterm'
  | 'ta-extension-request'
  | 'ta-regrade-pushback'
  | 'ta-group-project-conflict'
  | 'ta-office-hours-overload'
  | 'ta-academic-integrity-flag'
  | 'ta-late-add-catchup'
  | 'ta-lab-feedback'
  | 'ta-accessibility-accommodations'
  | 'ta-language-barrier-support';

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
        shortDescription: 'A resident is frustrated about loud neighbors and not being able to sleep.',
        openingLine:
          "Hi, I'm really at my limit with the noise on my floor. I've got an exam tomorrow and I haven't slept.",
      },
      {
        id: 'ra-homesick',
        trackId: 'ra',
        title: 'Homesick First-Year',
        shortDescription: 'A first-year student is feeling lonely, overwhelmed, and misses home a lot.',
        openingLine:
          "It's only been a few weeks and I already feel overwhelmed and homesick. I'm not sure I belong here.",
      },
      {
        id: 'ra-roommate-conflict',
        trackId: 'ra',
        title: 'Roommate Conflict over Guests',
        shortDescription:
          'One roommate keeps inviting friends over late, leaving the other feeling disrespected in their own space.',
        openingLine:
          "I've talked to them about the late-night guests so many times, but nothing changes and I'm ready to move out.",
      },
      {
        id: 'ra-guest-policy-violation',
        trackId: 'ra',
        title: 'Repeated Guest Policy Violation',
        shortDescription:
          'A resident was written up twice for bypassing the check-in desk and is upset about the consequences.',
        openingLine:
          "Security acted like I'm a criminal just because my friend forgot their ID again, and now I'm on probation?",
      },
      {
        id: 'ra-cleanliness-dispute',
        trackId: 'ra',
        title: 'Shared Kitchen Cleanliness Dispute',
        shortDescription:
          'Neighbors are escalating arguments about dirty dishes, bugs, and ignored cleaning rotations.',
        openingLine:
          "The sink is full of crusty dishes again and I'm done being the only one who cares if bugs take over our suite.",
      },
      {
        id: 'ra-wellness-check-in',
        trackId: 'ra',
        title: 'Wellness Check After Concerning Post',
        shortDescription:
          'Friends reported a resident\'s alarming social post, and you need to talk with them about safety without losing trust.',
        openingLine:
          "I know people are worried, but I don't need the school involved every time I vent online. I'm fine.",
      },
      {
        id: 'ra-party-incident-followup',
        trackId: 'ra',
        title: 'Aftermath of a Shut-Down Party',
        shortDescription:
          'Residents are angry about how last weekend\'s party was handled and feel targeted by housing staff.',
        openingLine:
          "You could have just warned us, but instead my whole floor thinks I snitched and now everyone is mad at me.",
      },
      {
        id: 'ra-maintenance-delay',
        trackId: 'ra',
        title: 'Maintenance Delay Frustration',
        shortDescription:
          'A resident with asthma has been waiting weeks for ventilation repairs and is escalating the issue.',
        openingLine:
          "Facilities keeps saying they'll come soon, but I've been coughing all week. What am I supposed to do?",
      },
      {
        id: 'ra-cultural-tension',
        trackId: 'ra',
        title: 'Cultural Tension on the Floor',
        shortDescription:
          'Two residents feel stereotyped and excluded after insensitive jokes were made in the lounge.',
        openingLine:
          "People say the comments are just jokes, but it's exhausting feeling like I'm the punchline every time we hang out.",
      },
      {
        id: 'ra-fire-alarm-fatigue',
        trackId: 'ra',
        title: 'Fire Alarm Fatigue',
        shortDescription:
          'Students are irritated after multiple late-night fire drills triggered by burnt popcorn and pranks.',
        openingLine:
          "Three alarms in two weeks? I have labs at 8 a.m. and I'm done losing sleep because someone can't use a microwave.",
      },
      {
        id: 'ra-food-allergy-concern',
        trackId: 'ra',
        title: 'Food Allergy Concern in Shared Space',
        shortDescription:
          'A resident with a severe allergy wants new safeguards after repeated cross-contamination scares.',
        openingLine:
          "I've asked everyone to label ingredients, but people still leave nut butter everywhere and it isn't safe for me.",
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
        shortDescription: 'A student is discouraged after doing poorly on a midterm exam.',
        openingLine:
          "Hi, I just saw my midterm grade on Canvas and I honestly don't know how I'm supposed to pass this class now.",
      },
      {
        id: 'ta-extension-request',
        trackId: 'ta',
        title: 'Last-Minute Extension Request',
        shortDescription: 'A student is asking for an extension very close to the deadline.',
        openingLine:
          "I know the assignment is due tonight, but a lot of stuff came up this week. Is there any way I could get an extension?",
      },
      {
        id: 'ta-regrade-pushback',
        trackId: 'ta',
        title: 'Persistent Regrade Pushback',
        shortDescription:
          'A student insists their short-answer responses deserve full credit and emails daily until you meet with them.',
        openingLine:
          "I compared my answer to the solution set and it matches, so why did the grader take points off?",
      },
      {
        id: 'ta-group-project-conflict',
        trackId: 'ta',
        title: 'Group Project Conflict',
        shortDescription:
          'Team members accuse one another of slacking and want you to fix grading fairness.',
        openingLine:
          "We're doing all the work while he ghosts meetings, and it's not fair that he'll get the same grade.",
      },
      {
        id: 'ta-office-hours-overload',
        trackId: 'ta',
        title: 'Office Hours Overload',
        shortDescription:
          'A frustrated student feels rushed through office hours and wants more one-on-one help before the exam.',
        openingLine:
          "Every time I show up there is a huge line and I get five minutes. How am I supposed to actually learn the material?",
      },
      {
        id: 'ta-academic-integrity-flag',
        trackId: 'ta',
        title: 'Academic Integrity Warning',
        shortDescription:
          'You must address suspiciously similar lab reports without accusing a student unfairly.',
        openingLine:
          "My lab partner and I studied together, sure, but we didn't copy anything. Why am I being singled out?",
      },
      {
        id: 'ta-late-add-catchup',
        trackId: 'ta',
        title: 'Late Add Trying to Catch Up',
        shortDescription: 'A student who joined mid-semester is overwhelmed and needs a plan to get on track.',
        openingLine:
          "I just got off the waitlist and I'm already three assignments behind. Where do I even start?",
      },
      {
        id: 'ta-lab-feedback',
        trackId: 'ta',
        title: 'Harsh Lab Feedback Concern',
        shortDescription:
          'A student felt embarrassed by public critique during lab and wants reassurance it will not happen again.',
        openingLine:
          "When you pointed out my mistake in front of everyone I just wanted to disappear. Can we talk about that?",
      },
      {
        id: 'ta-accessibility-accommodations',
        trackId: 'ta',
        title: 'Accessibility Accommodation Follow-Up',
        shortDescription:
          'A student with registered accommodations feels the course structure still leaves them behind.',
        openingLine:
          "My letter says I get extra time, but the in-class quizzes happen so fast that I still can't finish.",
      },
      {
        id: 'ta-language-barrier-support',
        trackId: 'ta',
        title: 'Language Barrier Support',
        shortDescription:
          'An international student struggles to understand idioms used in lectures and wants inclusive resources.',
        openingLine:
          'I study the textbook constantly, but in discussion I miss half the examples and fall behind.',
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
