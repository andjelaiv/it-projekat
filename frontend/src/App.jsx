import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import LoginRequired from "./pages/LoginRequired";
import Auth from "./pages/Auth";

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
          <Route path="/moja-kolekcija" element={<h1>Moja kolekcija</h1>} />
          <Route path="/favoriti" element={<h1>Moji favoriti</h1>} />
          <Route path="/prijava" element={<Auth />} />
          <Route path="/admin" element={<h1>Admin panel</h1>} />
          <Route path="/prijava-potrebna" element={<LoginRequired />} />
        </Routes>
      </main>
    </>
  );
}

export default App;