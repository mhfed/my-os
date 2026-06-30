import { GymScreen } from '@/features/gym/GymScreen';
import { HealthDashboard } from '@/features/gym/HealthDashboard';
import { useGymStore } from '@/store/gymStore';

export default function HealthScreen() {
  const isWorkoutActive = useGymStore((s) => s.isWorkoutActive);

  if (isWorkoutActive) {
    return <GymScreen />;
  }
  return <HealthDashboard />;
}
