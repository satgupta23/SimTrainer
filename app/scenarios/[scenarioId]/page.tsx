import { notFound } from 'next/navigation';
import ScenarioScreen from '@/components/ScenarioScreen';
import { SCENARIOS, ScenarioId, getScenario } from '@/data/tracks';

type ScenarioPageProps = {
  params: Promise<{ scenarioId: ScenarioId }>;
};

export function generateStaticParams() {
  return SCENARIOS.map((scenario) => ({ scenarioId: scenario.id }));
}

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const { scenarioId } = await params;
  const scenario = getScenario(scenarioId);
  if (!scenario) {
    notFound();
  }

  const { trackId, ...scenarioConfig } = scenario;

  return <ScenarioScreen trackId={trackId} scenario={scenarioConfig} />;
}
