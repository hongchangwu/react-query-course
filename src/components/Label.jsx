import { useLabelsData } from "../helpers/useLabelsData";

export function Label({ label }) {
  const labelsQuery = useLabelsData();

  if (labelsQuery.isLoading) return null;

  const labelsObj = labelsQuery.data.find((lbl) => lbl.id === label);
  if (!labelsObj) return null;

  return <span className={`label ${labelsObj.color}`}>{labelsObj.name}</span>;
}
