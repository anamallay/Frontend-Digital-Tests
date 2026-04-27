import { Outlet } from "react-router-dom";
import Header from "../components/Main/Header";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;