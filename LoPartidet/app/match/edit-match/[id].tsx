import { useLocalSearchParams } from "expo-router";
import MatchForm from "@/components/MatchForm";

export default function EditMatch() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MatchForm matchId={id} />;
}
