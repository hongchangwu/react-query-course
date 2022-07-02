import { useLabelsData } from "../helpers/useLabelsData";

export default function LabelList({ selected, toggle }) {
  const labelsQuery = useLabelsData();

  console.log(labelsQuery.data);

  return (
    <div className="labels ">
      <h3>Labels</h3>
      {labelsQuery.isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {labelsQuery.data.map((label) => (
            <li key={label.id}>
              <button
                className={`label ${
                  selected.includes(label.name) ? "selected" : ""
                } ${label.color}`}
                onClick={() => toggle(label.name)}
              >
                {label.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
