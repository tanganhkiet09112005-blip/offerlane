export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-template="store-page">
      {children}
    </div>
  );
}
