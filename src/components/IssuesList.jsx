import { useState } from "react";
import { useQuery } from "react-query";
import { IssueItem } from "./IssueItem";

export default function IssuesList({ labels, status }) {
  const [search, setSearch] = useState("");
  const searchQuery = useQuery(
    ["issues", "search", search],
    ({ signal }) => {
      return fetch(`/api/search/issues?q=${search}`, { signal }).then((res) =>
        res.json()
      );
    },
    {
      enabled: search !== "",
    }
  );
  const issuesQuery = useQuery(["issues", { labels, status }], ({ signal }) => {
    const labelsString = labels.map((label) => `labels[]=${label}`).join("&");
    const statusString = status ? `&status=${status}` : "";
    return fetch(`/api/issues?${labelsString}${statusString}`, { signal }).then(
      (res) => res.json()
    );
  });
  console.debug(searchQuery.data);

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(event.target.search.value);
        }}
      >
        <label htmlFor="search">Search Issues</label>
        <input
          type="search"
          placeholder="Search"
          name="search"
          id="search"
          onChange={(event) => {
            if (event.target.value.length === 0) {
              setSearch("");
            }
          }}
        />
      </form>
      {issuesQuery.isLoading ? (
        <p>Loading...</p>
      ) : searchQuery.fetchStatus === "idle" && searchQuery.isLoading ? (
        <>
          <h2>Issues List</h2>
          <ul className="issues-list">
            {issuesQuery.data?.map((issue) => (
              <IssueItem
                key={issue.id}
                title={issue.title}
                number={issue.number}
                assignee={issue.assignee}
                commentCount={issue.comments.length}
                createdBy={issue.createdBy}
                createdDate={issue.createdDate}
                labels={issue.labels}
                status={issue.status}
              />
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2>Search Results</h2>
          {searchQuery.isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>{searchQuery.data.count} Results</p>
              <ul className="issues-list">
                {searchQuery.data?.items.map((issue) => (
                  <IssueItem
                    key={issue.id}
                    title={issue.title}
                    number={issue.number}
                    assignee={issue.assignee}
                    commentCount={issue.comments.length}
                    createdBy={issue.createdBy}
                    createdDate={issue.createdDate}
                    labels={issue.labels}
                    status={issue.status}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
