import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { IssueItem } from "./IssueItem";
import Loader from "./Loader";

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
  const queryClient = useQueryClient()
  const issuesQuery = useQuery(["issues", { labels, status }], async ({ signal }) => {
    const labelsString = labels.map((label) => `labels[]=${label}`).join("&");
    const statusString = status ? `&status=${status}` : "";
    const results = await fetch(`/api/issues?${labelsString}${statusString}`, { signal }).then(
      (res) => res.json()
    );

    results.forEach((issue) => {
      console.log(`issue=${JSON.stringify(issue)}`)
      queryClient.setQueryData(["issues", issue.number.toString()], issue)
    })

    return results
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
          <h2>Issues List {issuesQuery.isFetching ? <Loader /> : null}</h2>
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
