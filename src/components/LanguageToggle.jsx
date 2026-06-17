export default function LanguageToggle({ language, setLanguage }) {
  const isArabic = language === "ar";

  return (
    <div className="language-toggle">
      <span>EN</span>

      <button
        type="button"
        className={`toggle-btn ${isArabic ? "active" : ""}`}
        onClick={() => setLanguage(isArabic ? "en" : "ar")}
      >
        <span />
      </button>

      <span>AR</span>
    </div>
  );
}