import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projekti" element={<h1>Svi projekti</h1>} />
          <Route path="/moja-kolekcija" element={<h1>Moja kolekcija</h1>} />
          <Route path="/favoriti" element={<h1>Moji favoriti</h1>} />
          <Route path="/prijava" element={<h1>Prijava</h1>} />
          <Route path="/admin" element={<h1>Admin panel</h1>} />
        </Routes>
      </main>
    </>
  );
}

export default App;