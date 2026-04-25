export { proxy as middleware } from "./proxy";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/budgets/:path*",
    "/reports/:path*",
    "/categories/:path*",
    "/login",
    "/register",
  ],
};