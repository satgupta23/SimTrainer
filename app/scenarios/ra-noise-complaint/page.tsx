import ScenarioScreen from '@/components/ScenarioScreen';

export default function Page() {
  return (
    <ScenarioScreen
      trackId="ra"
      scenario={{
        id: 'ra-noise-complaint',
        title: 'Noise Complaint at 2 AM',
        shortDescription:
          'Handle a resident upset about loud neighbors late at night.',
        openingLine:
          'Hi, thanks for meeting with me. (This is a placeholder opening line for the scenario.)',
      }}
    />
  );
}
