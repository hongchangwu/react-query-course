import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { IssueItem } from "./IssueItem";
import Loader from "./Loader";

export default function IssuesList({ labels, status, page, setPage }) {
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
  const queryClient = useQueryClient();
  const issuesQuery = useQuery(
    ["issues", { labels, status, page }],
    async ({ signal }) => {
      const labelsString = labels.map((label) => `labels[]=${label}`).join("&");
      const statusString = status ? `&status=${status}` : "";
      const paginationString = page ? `&page=${page}` : "";
      const results = await fetch(
        `/api/issues?${labelsString}${statusString}${paginationString}`,
        { signal }
      ).then((res) => res.json());

      results.forEach((issue) => {
        queryClient.setQueryData(["issues", issue.number.toString()], issue);
      });

      return results;
    },
    { keepPreviousData: true }
  );

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
          <div className="pagination">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || issuesQuery.isPreviousData}
            >
              Prev
            </button>
            <span>
              Page {page}
              {issuesQuery.isPreviousData ? " ..." : ""}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={
                !issuesQuery.data ||
                issuesQuery.data.length === 0 ||
                issuesQuery.isPreviousData
              }
            >
              Next
            </button>
          </div>
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
