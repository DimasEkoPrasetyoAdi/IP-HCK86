import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router";
import { useSelector } from 'react-redux';

import HomePublic from './pages/HomePublic';
import LoginPage from "./pages/LoginPage";
import UserPage from "./pages/UserPage";
import RegisterPage from './pages/RegisterPage';
import TripForm from "./pages/TripForm";
import TripDetail from "./pages/TripDetail";
import FavouriteTrips from "./pages/FavouriteTrips";
import PublicTrip from "./pages/PublicTrip";

// Protected route wrapper
function ProtectedRoute() {
  const { isAuthenticated, bootstrapDone } = useSelector((s)=>s.auth);
  const token = localStorage.getItem('access_token');
  if (!bootstrapDone) return null; // or a spinner component
  if (!isAuthenticated && !token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Guest-only route wrapper (redirect logged-in users away from auth pages)
function GuestRoute() {
  const { isAuthenticated, bootstrapDone } = useSelector((s)=>s.auth);
  const token = localStorage.getItem('access_token');
  if (!bootstrapDone) return null;
  if (isAuthenticated || token) return <Navigate to="/trips" replace />;
  return <Outlet />;
}

// Optional simple 404
function NotFound() {
  return <div className="p-10 text-center text-sm text-gray-500">Page not found</div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public & guest routes */}
        <Route element={<GuestRoute />}> 
          <Route path="/" element={<HomePublic />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected (requires auth) */}
        <Route element={<ProtectedRoute />}> 
          <Route path="/trips" element={<UserPage />} />
          <Route path="/trips/new" element={<TripForm />} />
          <Route path="/trips/:id/edit" element={<TripForm />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/favourites" element={<FavouriteTrips />} />
        </Route>

        {/* Public share link accessible by anyone */}
        <Route path="/share/:slug" element={<PublicTrip />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
