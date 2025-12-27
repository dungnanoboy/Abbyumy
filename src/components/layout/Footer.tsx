import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">🍳 Abbyumy</h3>
            <p className="text-sm mb-4">
              Nền tảng chia sẻ công thức nấu ăn, kết nối cộng đồng yêu thích ẩm thực Việt Nam.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-orange-500 transition-colors">
                <span className="text-xl">📘</span>
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <span className="text-xl">📷</span>
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <span className="text-xl">🐦</span>
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <span className="text-xl">▶️</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Khám phá</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/recipes" className="hover:text-orange-500 transition-colors">
                  Công thức
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-orange-500 transition-colors">
                  Danh mục
                </Link>
              </li>
              <li>
                <Link href="/trending" className="hover:text-orange-500 transition-colors">
                  Thịnh hành
                </Link>
              </li>
              <li>
                <Link href="/cooksnap" className="hover:text-orange-500 transition-colors">
                  Cooksnap
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-semibold mb-4">Cộng đồng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-orange-500 transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-orange-500 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="hover:text-orange-500 transition-colors">
                  Thử thách
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-orange-500 transition-colors">
                  Hướng dẫn cộng đồng
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-orange-500 transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-orange-500 transition-colors">
                  Góp ý
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-orange-500 transition-colors">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-orange-500 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>© 2025 Abbyumy. All rights reserved.</p>
          <p className="mt-2 text-gray-400">
            Làm cho việc vào bếp vui hơn mỗi ngày ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
