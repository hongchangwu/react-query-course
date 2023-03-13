import { useState } from "react";
import { GoGear } from "react-icons/go";
import { useMutation, useQueryClient } from "react-query";
import { useLabelsData } from "../helpers/useLabelsData";

export default function IssueLabels({ labels, issueNumber }) {  
  const labelsQuery = useLabelsData();
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const setLabels = useMutation(
    (labelId) => {
      const newLabels = labels.includes(labelId)
        ? labels.filter((label) => label !== labelId)
        : [...labels, labelId];
      return fetch(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ labels: newLabels }),
      }).then((res) => res.json());
    },
    {
      onMutate: (labelId) => {
        const oldLabels = queryClient.getQueryData([
          "issues",
          issueNumber,
        ]).labels;
        const newLabels = oldLabels.includes(labelId)
          ? oldLabels.filter((label) => label !== labelId)
          : [...oldLabels, labelId];
        queryClient.setQueryData(["issues", issueNumber], (data) => {
          return {
            ...data,
            labels: newLabels,
          };
        });
        return () => {
          queryClient.setQueryData(["issues", issueNumber], (data) => {
            const rollbackLabels = oldLabels.includes(labelId)
              ? [...data.labels, labelId]
              : data.labels.filter((label) => label !== labelId);
            return {
              ...data,
              labels: rollbackLabels,
            };
          });
        };
      },
      onSettled: () => {
        queryClient.invalidateQueries(["issues", issueNumber], { exact: true });
      },
      onError: (error, variables, rollback) => {
        rollback();
      },
    }
  );

  return (
    <div className="issue-options">
      <div>
        <span>Labels</span>
        {!labelsQuery.isLoading &&
          labels.map((labelId) => {
            const label = labelsQuery.data.find(
              (label) => label.id === labelId
            );
            if (!label) return null;

            return (
              <span key={labelId} className={`label ${label.color}`}>
                {label.name}
              </span>
            );
          })}
      </div>
      <GoGear
        onClick={() => !labelsQuery.isLoading && setMenuOpen((open) => !open)}
      />
      {menuOpen && (
        <div className="picker-menu labels">
          {labelsQuery.data?.map((label) => {
            const selected = labels.includes(label.id);
            return (
              <div
                key={label.id}
                className={selected ? "selected" : ""}
                onClick={() => {
                  setLabels.mutate(label.id);
                }}
              >
                <span
                  className="label-dot"
                  style={{ backgroundColor: label.color }}
                ></span>
                {label.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
