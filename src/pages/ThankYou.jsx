import Layout from "../components/Layout";

export default function ThankYou({ language }) {
  return (
    <Layout bgImage="/images/thankyou-bg.jpg">
      <div className="thankyou-page">
        <img
          src={
            language === "ar"
              ? "/images/thankyou-text-ar.svg"
              : "/images/thankyou-text-en.svg"
          }
          className="thankyou-text-img"
          alt="Thank you"
        />
      </div>
    </Layout>
  );
}