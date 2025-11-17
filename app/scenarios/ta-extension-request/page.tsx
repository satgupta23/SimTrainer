import ScenarioScreen from '@/components/ScenarioScreen';

export default function Page() {
  return (
    <ScenarioScreen
      trackId="ta"
      scenario={{
        id: 'ta-extension-request',
        title: 'Last-Minute Extension Request',
        shortDescription:
          'Handle a student asking for a last-minute extension on an assignment.',
        openingLine:
          "Hey, I’m really sorry to email you so late, but is there any way I could get an extension on the project?",
      }}
    />
  );
}
