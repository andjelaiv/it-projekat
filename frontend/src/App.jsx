import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import LoginRequired from "./pages/LoginRequired";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import Collection from "./pages/Collection";
import AddProject from "./pages/AddProject";
import EditProject from "./pages/EditProject";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projekti" element={<Projects />} />
          <Route path="/projekti/:id" element={<ProjectDetails />} />
          <Route path="/moja-kolekcija" element={<Collection />} />
          <Route path="/favoriti" element={<Favorites />} />
          <Route path="/prijava" element={<Auth />} />
          <Route path="/prijava-potrebna" element={<LoginRequired />} />
          <Route
            path="/dodaj-projekat"
            element={
              <ProtectedRoute>
                <AddProject />
              </ProtectedRoute>
            }
          />

          <Route
            path="/uredi-projekat/:id"
            element={
              <ProtectedRoute>
                <EditProject />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route path="/profil/:id" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;