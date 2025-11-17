import ScenarioScreen from '@/components/ScenarioScreen';

export default function Page() {
  return (
    <ScenarioScreen
      trackId="ra"
      scenario={{
        id: 'ra-homesick',
        title: 'Homesick First-Year',
        shortDescription:
          'Support a first-year resident who is feeling homesick and overwhelmed.',
        openingLine:
          "Hi… I know this might sound silly, but I've just been feeling really homesick lately.",
      }}
    />
  );
}
