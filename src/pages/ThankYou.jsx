import Layout from "../components/Layout";

export default function ThankYou({ t }) {
  return (
    <Layout>
      <div className="thankyou">
        <h1>{t.thanks}</h1>
        <img src="/images/cow.png" className="cow-img" alt="" />
      </div>
    </Layout>
  );
}