import { useState } from "react";
import Layout from "../components/Layout";
import { FiUpload } from "react-icons/fi";

export default function Register({ t, language, goNext }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    receipt: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm({
      ...form,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      ...form,
      language
    });

    goNext();
  };

  const handleReceiptUpload = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  setForm({
    ...form,
    receipt: file
  });

  if (
    form.name &&
    form.mobile &&
    form.email
  ) {
    goNext();
  } else {
    alert("Please complete all fields");
  }
};

  return (
    <Layout bgImage="/images/bg-home.jpg">
      <form className="register-page" onSubmit={handleSubmit}>
        <img
          src={
            language === "ar"
              ? "/images/register-title-ar.svg"
              : "/images/register-title-en.svg"
          }
          className="register-title-img"
          alt="Register Now"
        />

        {/* <p className="register-desc">{t.description}</p> */}

        <div className="form-fields">
          <label>{t.name}</label>
          <input name="name" value={form.name} onChange={handleChange} />

          <label>{t.mobile}</label>
          <input name="mobile" value={form.mobile} onChange={handleChange} />

          <label>{t.email}</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <img src="/images/cow.png" className="register-cow" alt="" />

        <label className="receipt-upload-btn">
          <FiUpload className="upload-icon" />
          {form.receipt ? form.receipt.name : t.upload}
          <input
            name="receipt"
            type="file"
            accept="image/*,.pdf"
            onChange={handleReceiptUpload}
          />
        </label>

        <button className="hidden-submit" type="submit" />
      </form>
    </Layout>
  );
}