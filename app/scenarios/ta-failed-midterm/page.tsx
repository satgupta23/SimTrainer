import ScenarioScreen from '@/components/ScenarioScreen';

export default function Page() {
  return (
    <ScenarioScreen
      trackId="ta"
      scenario={{
        id: 'ta-failed-midterm',
        title: 'Student Upset About Failed Midterm',
        shortDescription:
          'Talk with a student who is upset about failing a midterm and worried about the class.',
        openingLine:
          "Hi, I saw my midterm grade on Canvas and… I honestly don't know how I’m supposed to pass this class now.",
      }}
    />
  );
}
