import { useState } from "react";
import Layout from "../components/Layout";

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

  return (
    <Layout>
      <form className="register-form" onSubmit={handleSubmit}>
        <h1>{t.register}</h1>
        <p>{t.description}</p>

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

        <label className="upload-box">
          {form.receipt ? form.receipt.name : t.upload}
          <input
            name="receipt"
            type="file"
            accept="image/*,.pdf"
            onChange={handleChange}
          />
        </label>

        <button className="primary-btn form-btn" type="submit">
          {t.submit}
        </button>
      </form>
    </Layout>
  );
}