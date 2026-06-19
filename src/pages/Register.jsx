import { useState, useRef  } from "react";
import Layout from "../components/Layout";
import { FiUpload } from "react-icons/fi";
import { termsContent } from "../data/terms";


const CLOUDINARY_CLOUD_NAME = "da4ztxlh7";
const CLOUDINARY_UPLOAD_PRESET = "ivqr_image";
// const APPS_SCRIPT_URL =
//   "https://script.google.com/macros/s/AKfycbxwcs_Q1fkVhqoZ7qohlzmqtO7_LGnG1-Lj1JsyKa3EVDNpyRDxx2vCAKbEUO21Rzz08w/exec";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyQq6EfIUPQCnB3mEoMj98Ss3WFa8_D38iVwDKJFU4zceBMkaFaqoMZokUpcu0OLb7T/exec";



async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob.size <= 300 * 1024) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              canvas.toBlob(
                (blob2) => {
                  resolve(new File([blob2], file.name, { type: "image/jpeg" }));
                },
                "image/jpeg",
                0.6
              );
            }
          },
          "image/jpeg",
          0.8
        );
      };
    };
  });
}

async function uploadToCloudinary(file) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();
  return data.secure_url;
}

async function saveToGoogleSheets(name, mobile, city, nationalId, email, receiptUrl) {
  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({
      name,
      mobile,
      city,
      national_id: nationalId,
      email,
      receipt_url: receiptUrl
    })
  });
}

export default function Register({ t, language, goNext }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    city: "",
    nationalId: "",
    email: "",
    receipt: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm({
      ...form,
      [name]: files ? files[0] : value
    });
    if (name === "email") {
    setError("");
  }
  };

  const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


const validateForm = () => {
  if (!form.name || !form.mobile || !form.city || !form.nationalId || !form.email) {
    setError("Please complete all fields");
    return false;
  }

  if (!isValidEmail(form.email)) {
    setError("Please enter a valid email address");
    return false;
  }

 

if (!acceptedTerms) {
  setError(
    language === "ar"
      ? "يرجى الموافقة على الشروط والأحكام"
      : "Please accept the Terms & Conditions"
  );
  return false;
}

  setError("");
  return true;
};

const submitForm = async (file = null) => {
  if (!validateForm()) {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    return;
  }

  setLoading(true);
  setError("");

  try {
    let receiptUrl = "";

    if (file) {
      const compressed = await compressImage(file);

      console.log("Original KB:", Math.round(file.size / 1024));
      console.log("Compressed KB:", Math.round(compressed.size / 1024));

      receiptUrl = await uploadToCloudinary(compressed);
    }

    await saveToGoogleSheets(
      form.name,
      form.mobile,
      form.city,
      form.nationalId,
      form.email,
      receiptUrl
    );

    goNext();
  } catch (err) {
    console.error("Submission error:", err);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

const handleNextClick = async () => {
  await submitForm(null);
};

const handleReceiptUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setForm({
    ...form,
    receipt: file
  });

  await submitForm(file);
};

 

  return (
    <Layout bgImage="/images/bg-home.jpg">
      <form className="register-page" onSubmit={(e) => e.preventDefault()}>
        <img
          src={
            language === "ar"
              ? "/images/register-title-ar.svg"
              : "/images/register-title-en.svg"
          }
          className="register-title-img"
          alt="Register Now"
        />

        <div className="form-fields">
          <label>{t.name}</label>
          <input name="name" value={form.name} onChange={handleChange} />

          <label>{t.mobile}</label>
          <input name="mobile" value={form.mobile} onChange={handleChange} />

          <label>{t.city || "CITY"}</label>
<input
  name="city"
  value={form.city}
  onChange={handleChange}
/>

          <label>{t.nationalId || "NATIONAL ID"}</label>
          <input
            name="nationalId"
            value={form.nationalId}
            onChange={handleChange}
          />

          <label>{t.email}</label>
<input
  name="email"
  type="email"
  value={form.email}
  onChange={handleChange}
/>

{error && (
  <div className="field-error">
    {error}
  </div>
)}

<div className="terms-box">
  <label className="terms-label">
    <input
      type="checkbox"
      checked={acceptedTerms}
      onChange={(e) => {
        setAcceptedTerms(e.target.checked);
        setError("");
      }}
    />

    {/* <span>
      {language === "ar" ? "أوافق على " : "I agree to the "}
      <button
        type="button"
        className="terms-link"
        onClick={() => setShowTerms(true)}
      >
        {language === "ar"
          ? "الشروط والأحكام"
          : "Terms & Conditions"}
      </button>
    </span> */}

    <span>
  {language === "ar" ? (
    <>
      لقد قرأتُ
      <button
        type="button"
        className="terms-link"
        onClick={() => setShowTerms(true)}
      >
        الشروط والأحكام
      </button>
      وفهمتها وأوافق عليها.
    </>
  ) : (
    <>
      I have read, understood and agree to the
      <button
        type="button"
        className="terms-link"
        onClick={() => setShowTerms(true)}
      >
        Terms and Conditions
      </button>
      .
    </>
  )}
</span>
  </label>
</div>
</div>

        {/* <img src="/images/cow.png" className="register-cow" alt="" /> */}

        <button
  type="button"
  className={`next-btn ${loading ? "disabled" : ""}`}
  onClick={handleNextClick}
  disabled={loading}
>
  {loading ? "Submitting..." : t.next || "NEXT"}
</button>

        <label className={`receipt-upload-btn ${loading ? "disabled" : ""}`}>
          <FiUpload className="upload-icon" />
          {loading
            ? "Uploading..."
            : form.receipt
            ? form.receipt.name
            : t.upload}

          <input
            ref={fileInputRef}
            name="receipt"
            type="file"
            accept="image/*"
            onClick={(e) => {
    e.target.value = "";
  }}
            onChange={handleReceiptUpload}
            disabled={loading}
          />
        </label>
        {showTerms && (
  <div className="terms-popup">
    <div className={`terms-modal ${language === "ar" ? "terms-rtl" : ""}`}>
      <h2>{termsContent[language].title}</h2>

      <div className="terms-content">
        {termsContent[language].text}
      </div>

      <button
        type="button"
        className="terms-close-btn"
        onClick={() => setShowTerms(false)}
      >
        {language === "ar" ? "إغلاق" : "Close"}
      </button>
    </div>
  </div>
)}
      </form>
    </Layout>
  );
}