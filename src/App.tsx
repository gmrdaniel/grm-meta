
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import CreatorRates from "./pages/admin/CreatorRates";
import Dashboard from "./pages/admin/Dashboard";
import Creators from "./pages/admin/Creators";
import Services from "./pages/admin/Services";
import CreatorServices from "./pages/admin/CreatorServices";
import ServicePayments from "./pages/admin/ServicePayments";
import PostTypes from "./pages/admin/PostTypes";
import CreatorProfile from "./pages/creator/CreatorProfile";
import BankDetail from "./pages/creator/BankDetail";
import PendingServices from "./pages/creator/PendingServices";
import Campaigns from "./pages/creator/Campaigns";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/admin/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/admin/creators",
    element: <Creators />,
  },
  {
    path: "/admin/services",
    element: <Services />,
  },
  {
    path: "/admin/creator-services",
    element: <CreatorServices />,
  },
  {
    path: "/admin/service-payments",
    element: <ServicePayments />,
  },
  {
    path: "/admin/post-types",
    element: <PostTypes />,
  },
  {
    path: "/admin/rates",
    element: <CreatorRates />,
  },
  {
    path: "/creator/profile",
    element: <CreatorProfile />,
  },
  {
    path: "/creator/bankDetail",
    element: <BankDetail />,
  },
  {
    path: "/creator/pending-services",
    element: <PendingServices />,
  },
  {
    path: "/creator/campaigns",
    element: <Campaigns />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
