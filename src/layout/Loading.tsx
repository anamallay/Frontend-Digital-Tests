const Loading = () => {
  return (
    <div className="w-12 h-12 grid grid-rows-3 grid-cols-3 justify-items-center items-center">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 bg-primaryLighter rounded-full animate-pulse`}
          style={{ animationDelay: `${(i % 4) * 0.25}s` }}
        ></div>
      ))}
    </div>
  );
};

export default Loading;
