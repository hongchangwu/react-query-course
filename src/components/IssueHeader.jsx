import { GoIssueClosed, GoIssueOpened } from "react-icons/go";
import { useUserData } from "../helpers/useUserData";
import { possibleStatus } from "../helpers/defaultData";
import { relativeDate } from "../helpers/relativeDate";

export const IssueHeader = ({
  title,
  number,
  status = "todo",
  createdBy,
  createdDate,
  comments,
}) => {
  console.debug(`title=${title} number=${number} status=${status}`);
  const statusObject = possibleStatus.find((st) => st.id === status);
  const createdUser = useUserData(createdBy);
  return (
    <header>
      <h2>
        {title} <span>#{number}</span>
      </h2>
      <div>
        <span
          className={
            status === "done" || status === "cancelled" ? "closed" : "open"
          }
        >
          {status === "done" || status === "cancelled" ? (
            <GoIssueClosed />
          ) : (
            <GoIssueOpened />
          )}
          {statusObject.label}
        </span>
        <span className="created-by">
          {createdUser.isLoading ? "..." : createdUser.data?.name}
        </span>{" "}
        opened this issue {relativeDate(createdDate)} ({comments.length}{" "}
        comments)
      </div>
    </header>
  );
};
