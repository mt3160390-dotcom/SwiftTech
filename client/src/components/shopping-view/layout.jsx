import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import Footer from './footer'; // Import the Footer component

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex flex-col w-full">
        <Outlet />
      </main>
       <Footer /> {/* Render the Footer component */}
    </div>
  );
}

export default ShoppingLayout;