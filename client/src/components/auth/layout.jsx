import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex items-center justify-center bg-black w-1/2 px-12">
        <div className="max-w-md space-y-6 text-center text-primary-foreground">
        <h1
  style={{
    fontSize: '2.25rem',
    fontWeight: '800',
    letterSpacing: '-0.025em',
      lineHeight: '1.25',
  }}
>
  Welcome to{" "}
  <span
    style={{
      color: '#FFD700',
      fontFamily: 'Playfair Display, serif',
      fontSize: '2.65rem',

    }}
  >
    SwiftTech
  </span>
</h1>
<p
  style={{
    fontSize: '1.125rem',
    color: '#71717a',
    marginTop: '0.5rem',
  }}
>
  Where Innovation Meets Convenience
</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
