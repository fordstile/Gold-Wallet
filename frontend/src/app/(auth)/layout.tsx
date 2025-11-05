export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-gray-100 flex items-center justify-center p-6">
      {children}
    </div>
  );
}
