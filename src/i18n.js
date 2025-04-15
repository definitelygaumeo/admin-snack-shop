import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vi: {
    translation: {
      // Dashboard
      "dashboard": "Tổng quan",
      "total_sales": "Tổng doanh thu",
      "total_orders": "Tổng đơn hàng",
      "total_products": "Tổng sản phẩm",
      "total_customers": "Tổng khách hàng",
      "recent_orders": "Đơn hàng gần đây",
      "low_stock": "Sản phẩm sắp hết",
      
      // Navigation
      "home": "Trang chủ",
      "products": "Sản phẩm",
      "orders": "Đơn hàng",
      "customers": "Khách hàng",
      "reports": "Báo cáo",
      "settings": "Cài đặt",
      "logout": "Đăng xuất",
      
      // Products
      "product_list": "Danh sách sản phẩm",
      "add_product": "Thêm sản phẩm",
      "edit_product": "Sửa sản phẩm",
      "product_name": "Tên sản phẩm",
      "price": "Giá",
      "category": "Danh mục",
      "stock": "Tồn kho",
      "image": "Hình ảnh",
      "description": "Mô tả",
      "status": "Trạng thái",
      "actions": "Hành động",
      
      // Authentication
      "login": "Đăng nhập",
      "username": "Tên đăng nhập",
      "password": "Mật khẩu",
      "remember_me": "Ghi nhớ đăng nhập",
      "forgot_password": "Quên mật khẩu?",
      
      // Common
      "save": "Lưu",
      "cancel": "Hủy",
      "delete": "Xóa",
      "edit": "Sửa",
      "search": "Tìm kiếm"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;