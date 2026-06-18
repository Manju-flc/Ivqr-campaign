// import { useState } from "react";
// import Layout from "../components/Layout";
// import { FiUpload } from "react-icons/fi";

// export default function Register({ t, language, goNext }) {
//   const [form, setForm] = useState({
//     name: "",
//     mobile: "",
//     email: "",
//     receipt: null
//   });

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;

//     setForm({
//       ...form,
//       [name]: files ? files[0] : value
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log({
//       ...form,
//       language
//     });

//     goNext();
//   };

//   const handleReceiptUpload = (e) => {
//   const file = e.target.files?.[0];

//   if (!file) return;

//   setForm({
//     ...form,
//     receipt: file
//   });

//   if (
//     form.name &&
//     form.mobile &&
//     form.email
//   ) {
//     goNext();
//   } else {
//     alert("Please complete all fields");
//   }
// };

//   return (
//     <Layout bgImage="/images/bg-home.jpg">
//       <form className="register-page" onSubmit={handleSubmit}>
//         <img
//           src={
//             language === "ar"
//               ? "/images/register-title-ar.svg"
//               : "/images/register-title-en.svg"
//           }
//           className="register-title-img"
//           alt="Register Now"
//         />

        

//         <div className="form-fields">
//           <label>{t.name}</label>
//           <input name="name" value={form.name} onChange={handleChange} />

//           <label>{t.mobile}</label>
//           <input name="mobile" value={form.mobile} onChange={handleChange} />

//           <label>{t.email}</label>
//           <input
//             name="email"
//             type="email"
//             value={form.email}
//             onChange={handleChange}
//           />
//         </div>

//         <img src="/images/cow.png" className="register-cow" alt="" />

//         <label className="receipt-upload-btn">
//           <FiUpload className="upload-icon" />
//           {form.receipt ? form.receipt.name : t.upload}
//           <input
//             name="receipt"
//             type="file"
//             accept="image/*,.pdf"
//             onChange={handleReceiptUpload}
//           />
//         </label>

//         <button className="hidden-submit" type="submit" />
//       </form>
//     </Layout>
//   );
// }



import { useState } from "react";
import Layout from "../components/Layout";
import { FiUpload } from "react-icons/fi";

// ─── CONFIG ────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = "da4ztxlh7";       // from Cloudinary dashboard
const CLOUDINARY_UPLOAD_PRESET = "ivqr_image";   // from Settings → Upload presets
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwcs_Q1fkVhqoZ7qohlzmqtO7_LGnG1-Lj1JsyKa3EVDNpyRDxx2vCAKbEUO21Rzz08w/exec";   // from Google Apps Script deploy
// ───────────────────────────────────────────────────────────

// Step 1: Compress image to under 300 KB
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

        // Scale down large images
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

        // Try 80% quality first
        canvas.toBlob(
          (blob) => {
            if (blob.size <= 300 * 1024) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              // Still too large → compress harder at 60%
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

// Step 2: Upload compressed image to Cloudinary
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  return data.secure_url;
}

// Step 3: Save to Google Sheets
async function saveToGoogleSheets(name, mobile, email, receiptUrl) {
  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({ name, mobile, email, receipt_url: receiptUrl }),
  });
}

export default function Register({ t, language, goNext }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    receipt: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm({ ...form, receipt: file });

    if (!form.name || !form.mobile || !form.email) {
      alert("Please complete all fields before uploading receipt");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Compress
      const compressed = await compressImage(file);

      // 2. Upload to Cloudinary
      let receiptUrl = "upload_failed";
      try {
        receiptUrl = await uploadToCloudinary(compressed);
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        receiptUrl = "upload_failed";
      }

      // 3. Save to Google Sheets (always runs even if upload failed)
      await saveToGoogleSheets(form.name, form.mobile, form.email, receiptUrl);

      // 4. Go to thank you
      goNext();
    } catch (err) {
      console.error("Submission error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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

          <label>{t.email}</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <img src="/images/cow.png" className="register-cow" alt="" />

        {error && (
          <p style={{ color: "red", fontSize: "12px", textAlign: "center" }}>
            {error}
          </p>
        )}

        <label className={`receipt-upload-btn ${loading ? "disabled" : ""}`}>
          <FiUpload className="upload-icon" />
          {loading
            ? "Uploading..."
            : form.receipt
            ? form.receipt.name
            : t.upload}
          <input
            name="receipt"
            type="file"
            // accept="image/*,.pdf"
            accept="image/*"
            onChange={handleReceiptUpload}
            disabled={loading}
          />
        </label>
      </form>
    </Layout>
  );
}