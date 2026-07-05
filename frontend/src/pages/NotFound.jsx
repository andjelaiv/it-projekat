import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <section className="not-found-page">
      <div className="not-found-card">
        <span>🧶</span>
        <p>Ups, konac se negdje zapetljao...</p>
        <h1>404</h1>
        <h2>Stranica nije pronađena</h2>

        <Link to="/">Nazad na početnu</Link>
      </div>
    </section>
  );
}

export default NotFound;