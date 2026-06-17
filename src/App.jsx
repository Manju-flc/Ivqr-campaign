import { useState } from "react";
import Home from "./pages/Home";
import Register from "./pages/Register";
import ThankYou from "./pages/ThankYou";
import { translations } from "./data/translations";

export default function App() {
  const [language, setLanguage] = useState("en");
  const [page, setPage] = useState("home");

  const t = translations[language];
  const isArabic = language === "ar";

  return (
    <div className="browser-bg">
      <main className={`mobile-shell ${isArabic ? "rtl" : ""}`}>
        {page === "home" && (
          <Home
            t={t}
            language={language}
            setLanguage={setLanguage}
            goNext={() => setPage("register")}
          />
        )}

        {page === "register" && (
          <Register
            t={t}
            language={language}
            goNext={() => setPage("thankyou")}
          />
        )}

        {page === "thankyou" && <ThankYou t={t} />}
      </main>
    </div>
  );
}