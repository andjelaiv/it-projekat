import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

function Auth() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [message, setMessage] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;

    setLoginData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;

    setRegisterData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    axios
      .post("http://localhost:5000/api/auth/login", loginData)
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setMessage("Prijava je uspješna ✿");

        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 500);
      })
      .catch((error) => {
        setMessage(
          error.response?.data?.message ||
            "Došlo je do greške pri prijavi."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    axios
      .post("http://localhost:5000/api/auth/register", registerData)
      .then(() => {
        setMessage("Registracija je uspješna. Sada se možeš prijaviti ✿");

        setRegisterData({
          username: "",
          email: "",
          password: "",
        });

        setActiveTab("login");
      })
      .catch((error) => {
        setMessage(
          error.response?.data?.message ||
            "Došlo je do greške pri registraciji."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <span className="auth-sticker">Kloopko nalog</span>

        <div className="auth-header">
          <div className="auth-yarn">🧶</div>

          <h1>
            Dobro došao/la u <span>Kloopko</span>
          </h1>

          <p>
            Prijavi se ili napravi nalog da bi mogao/la da čuvaš favorite,
            praviš kolekciju i ostavljaš recenzije.
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={activeTab === "login" ? "active" : ""}
            onClick={() => {
              setActiveTab("login");
              setMessage("");
            }}
          >
            Prijava
          </button>

          <button
            type="button"
            className={activeTab === "register" ? "active" : ""}
            onClick={() => {
              setActiveTab("register");
              setMessage("");
            }}
          >
            Registracija
          </button>
        </div>

        {activeTab === "login" ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="npr. andjela@test.com"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </label>

            <label>
              Lozinka
              <input
                type="password"
                name="password"
                placeholder="Unesi lozinku"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </label>

            {message && <p className="auth-message">{message}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Provjerava se..." : "Prijavi se ♡"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <label>
              Korisničko ime
              <input
                type="text"
                name="username"
                placeholder="npr. kloopko_lover"
                value={registerData.username}
                onChange={handleRegisterChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="npr. ime@email.com"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
            </label>

            <label>
              Lozinka
              <input
                type="password"
                name="password"
                placeholder="Najmanje nekoliko karaktera"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
              />
            </label>

            {message && <p className="auth-message">{message}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Čuva se..." : "Napravi nalog ✿"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <span>✿</span>
          <Link to="/projekti">Samo želim da istražujem projekte</Link>
          <span>✦</span>
        </div>
      </div>
    </section>
  );
}

export default Auth;