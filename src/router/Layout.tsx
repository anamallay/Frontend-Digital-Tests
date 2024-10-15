import { Outlet } from "react-router-dom";
import Header from "../components/Main/Header";

const Layout = () => {
  return (
    <div>
      <Header />
      <div style={{ marginTop: "60px" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
