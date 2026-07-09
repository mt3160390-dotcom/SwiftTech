import { Navigate, useLocation } from "react-router-dom";

// These shop pages require login — guests get redirected to login
const PROTECTED_SHOP_PATHS = [
  "/shop/checkout",
  "/shop/account",
  "/shop/paypal-return",
  "/shop/esewa-return",
  "/shop/payment-success",
];

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  // Root "/" — guest lands on shop home, logged-in users go to their dashboard
  if (location.pathname === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/shop/home" />;
    } else {
      return user?.role === "admin"
        ? <Navigate to="/admin/dashboard" />
        : <Navigate to="/shop/home" />;
    }
  }

  if (!isAuthenticated) {
    const isAuthPage =
      location.pathname.includes("/auth/login") ||
      location.pathname.includes("/auth/register") ||
      location.pathname.includes("/admin/auth/login") ||
      location.pathname.includes("/admin/auth/register");

    // Let guests reach login / register pages
    if (isAuthPage) return <>{children}</>;

    // Block checkout, account, payment pages for guests
    const isProtected = PROTECTED_SHOP_PATHS.some((p) =>
      location.pathname.startsWith(p)
    );
    if (isProtected) return <Navigate to="/auth/login" />;

    // Block admin panel for guests
    if (
      location.pathname.startsWith("/admin/") &&
      !location.pathname.includes("/admin/auth")
    ) {
      return <Navigate to="/auth/login" />;
    }

    // Everything else (shop/home, shop/listing, shop/search …) — allow guests
    return <>{children}</>;
  }

  // Logged-in user on auth pages → go to their dashboard
  if (
    isAuthenticated &&
    (location.pathname.includes("/auth/login") ||
      location.pathname.includes("/auth/register") ||
      location.pathname.includes("/admin/auth/login") ||
      location.pathname.includes("/admin/auth/register"))
  ) {
    return user?.role === "admin"
      ? <Navigate to="/admin/dashboard" />
      : <Navigate to="/shop/home" />;
  }

  // Regular user trying to reach admin panel
  if (
    isAuthenticated &&
    user?.role !== "admin" &&
    location.pathname.includes("/admin/") &&
    !location.pathname.includes("/admin/auth")
  ) {
    return <Navigate to="/unauth-page" />;
  }

  // Admin trying to reach shop pages
  if (
    isAuthenticated &&
    user?.role === "admin" &&
    location.pathname.includes("/shop/")
  ) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <>{children}</>;
}

export default CheckAuth;
