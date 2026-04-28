import { Outlet } from "react-router-dom";

const UsersLayout = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Single grid layer — top + bottom effect via linear mask.
          Renders behind every /users route via React Router's <Outlet />. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "0 0",
          maskImage:
            "linear-gradient(to bottom, black 0%, transparent 30%, transparent 70%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, transparent 30%, transparent 70%, black 100%)",
        }}
      />

      <div className="relative">
        <Outlet />
      </div>
    </div>
  );
};

export default UsersLayout;
