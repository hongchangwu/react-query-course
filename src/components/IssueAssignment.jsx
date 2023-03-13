import { useState } from "react";
import { GoGear } from "react-icons/go";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useUserData } from "../helpers/useUserData";

export default function IssueAssignment({ assignee, issueNumber }) {
  const userQuery = useUserData(assignee);
  const [menuOpen, setMenuOpen] = useState(false);
  const usersQuery = useQuery(["users"], () =>
    fetch("/api/users").then((res) => res.json())
  );
  const queryClient = useQueryClient();
  const setAssignee = useMutation(
    (assignee) => {
      fetch(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ assignee }),
      }).then((res) => res.json());
    },
    {
      onMutate: (assignee) => {
        const oldAssignee = queryClient.getQueryData([
          "issues",
          issueNumber,
        ]).assignee;
        queryClient.setQueryData(["issues", issueNumber], (data) => {
          return {
            ...data,
            assignee,
          };
        });
        return () => {
          queryClient.setQueryData(["issues", issueNumber], (data) => {
            return {
              ...data,
              assignee: oldAssignee,
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
        <span>Assignment</span>
        {userQuery.isSuccess && (
          <div>
            <img src={userQuery.data.profilePictureUrl} />
            {userQuery.data.name}
          </div>
        )}
      </div>
      <GoGear
        onClick={() => !usersQuery.isLoading && setMenuOpen((open) => !open)}
      />
      {menuOpen && (
        <div className="picker-menu">
          {usersQuery.data?.map((user) => {
            return (
              <div
                key={user.id}
                onClick={() => {
                  setAssignee.mutate(user.id);
                }}
              >
                <img src={user.profilePictureUrl} />
                {user.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
