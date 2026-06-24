import { Link } from "react-router-dom";
import "./LoginRequired.css";

function LoginRequired() {
  return (
    <section className="login-required-page">
      <div className="login-required-card">
        <span className="error-sticker">401</span>

        <div className="yarn-icon">🧶</div>

        <h1>Stani, stani!</h1>

        <p>
          Pokušavaš da otvoriš kutak koji je rezervisan za članove Kloopka,
          ali Kloopko mora prvo da zna ko si.
        </p>

        <p>
          Prijavi se i tvoji favoriti, kolekcija i patterni biće sačuvani samo
          za tebe.
        </p>

        <div className="login-required-actions">
          <Link to="/prijava" className="login-required-primary">
            Prijavi se
          </Link>

          <Link to="/" className="login-required-secondary">
            Nazad na početnu
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LoginRequired;