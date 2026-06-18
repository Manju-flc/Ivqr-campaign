import Layout from "../components/Layout";
import LanguageToggle from "../components/LanguageToggle";

export default function Home({ t, language, setLanguage, goNext }) {
  return (
    <Layout bgImage="/images/bg-home.jpg">
      <div className="home-page">
        <div className="hero-section">
        <img src="/images/logo.png" className="home-logo" alt="Logo" />

        <img
  src={
    language === "ar"
      ? "/images/hero-text-ar.svg"
      : "/images/hero-text-en.svg"
  }
//   className="hero-text-img"
className={`hero-text-img ${language === "ar" ? "hero-text-ar" : "hero-text-en"}`}
  alt="Campaign text"
/>
</div>

        <button className="primary-btn home-start-btn" onClick={goNext}>
          {t.start}
        </button>

        <LanguageToggle language={language} setLanguage={setLanguage} />
      </div>
    </Layout>
  );
}