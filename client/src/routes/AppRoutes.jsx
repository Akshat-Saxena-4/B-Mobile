import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import Home from '../pages/customer/Home.jsx';
import Products from '../pages/customer/Products.jsx';
import ProductDetails from '../pages/customer/ProductDetails.jsx';
import Cart from '../pages/customer/Cart.jsx';
import Checkout from '../pages/customer/Checkout.jsx';
import Orders from '../pages/customer/Orders.jsx';
import Profile from '../pages/customer/Profile.jsx';
import Wishlist from '../pages/customer/Wishlist.jsx';
import ShopkeeperDashboard from '../pages/shopkeeper/Dashboard.jsx';
import AddProduct from '../pages/shopkeeper/AddProduct.jsx';
import ManageProducts from '../pages/shopkeeper/ManageProducts.jsx';
import ShopkeeperOrders from '../pages/shopkeeper/Orders.jsx';
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AdminUsers from '../pages/admin/Users.jsx';
import AdminProducts from '../pages/admin/Products.jsx';
import AdminOrders from '../pages/admin/Orders.jsx';
import AdminCoupons from '../pages/admin/Coupons.jsx';
import { fetchProfile } from '../store/slices/authSlice.js';
import { fetchCart, fetchWishlist } from '../store/slices/cartSlice.js';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES } from '../utils/constants.js';

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    if (token && user?.role === ROLES.CUSTOMER) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, token, user]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:identifier" element={<ProductDetails />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SHOPKEEPER, ROLES.ADMIN]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SHOPKEEPER, ROLES.ADMIN]}>
                <ShopkeeperDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/new"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SHOPKEEPER, ROLES.ADMIN]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SHOPKEEPER, ROLES.ADMIN]}>
                <ManageProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SHOPKEEPER, ROLES.ADMIN]}>
                <ShopkeeperOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminCoupons />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default AppRoutes;

