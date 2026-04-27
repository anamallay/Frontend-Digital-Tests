const Loading = () => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="inline-flex items-center justify-center"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
};

export default Loading;