// Shown in place of data when a backend call fails.
// error.notBuilt means Flask has no route for this URL yet — expected while
// the team is working through SPEC.md.
export default function EndpointNotice({ error, endpoint }) {
  if (!error) return null;

  const notBuilt = error.notBuilt;
  return (
    <div className={notBuilt ? "notice notice-todo" : "notice notice-error"}>
      <strong>{notBuilt ? "Not built yet" : "Request failed"}</strong>
      <span className="notice-endpoint">{endpoint}</span>
      {!notBuilt && <span>{error.message}</span>}
    </div>
  );
}
