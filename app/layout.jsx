import "../src/styles.css";

export const metadata = {
  title: "CigCount — See the air differently",
  description: "Understand your air quality as a cigarette equivalent."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
