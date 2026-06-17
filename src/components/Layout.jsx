export default function Layout({ children, bgImage }) {
  return (
    <section className="screen">
      <img src={bgImage} className="bg-img" alt="" />

      <div className="content">
        {children}
      </div>
    </section>
  );
}