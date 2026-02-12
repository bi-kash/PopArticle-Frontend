import ContactForm from "@/components/ContactForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <div style={{ flex: 1, background: "var(--surface)", padding: "3rem 0" }}>
        <ContactForm />
      </div>
      <Footer />
    </div>
  );
}
