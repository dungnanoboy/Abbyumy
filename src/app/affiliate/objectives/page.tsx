"use client";

import { Target, TrendingUp, Gift, Clock, CheckCircle } from "lucide-react";

export default function ObjectivesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Công tác mục tiêu</h1>
        <p className="text-gray-600 mt-1">
          Mời nhà sáng tạo ban thích quảng bá sản phẩm của bạn
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Đây là gì?
            </h2>
            <p className="text-gray-700">
              Với Công tác mục tiêu, bạn có thể thỉ tìm những nhà sáng tạo bạn muốn cộng tác 
              và gửi lời mời họ quảng bá sản phẩm của bạn vào nội dung họ tạo ra. Sau khi 
              gửi lời mời thành công, họ có thể tìm được lời mời của bạn qua tab Lời mời 
              trong phần Nhà sáng tạo và dễ dàng giới thiệu hàng hóa của bạn vào nội dung.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-teal-600" />
          Cách thức hoạt động
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-gray-900">Tìm nhà sáng tạo</h3>
            </div>
            <p className="text-sm text-gray-600 ml-13">
              Gửi lời mời cho họ. Bạn sẽ chọn sản phẩm và lý lẽ hoa hồng, 
              sau đó gửi lời mời và thông báo cho họ biết.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-gray-900">Theo dõi tiến độ</h3>
            </div>
            <p className="text-sm text-gray-600 ml-13">
              Xem bao nhiêu nhà sáng tạo đã xem sản phẩm của bạn và đang làm với 
              sản phẩm đó. Lọc các nhà sáng tạo đăng kí vào nội dung hiện tại của họ.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-gray-900">Theo dõi hiệu suất</h3>
            </div>
            <p className="text-sm text-gray-600 ml-13">
              Khi nhà sáng tạo bắt đầu giới thiệu các sản phẩm của bạn, 
              bạn có thể xem sản phẩm nào đang thực hiện tốt nhất.
            </p>
          </div>
        </div>
      </div>

      {/* Setup Campaign */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-teal-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Bắt đầu chiến dịch mục tiêu
          </h2>
          <p className="text-gray-600 mb-8">
            Thiết lập chiến dịch mục tiêu đầu tiên của bạn để kết nối với 
            những nhà sáng tạo phù hợp nhất cho sản phẩm của bạn
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/affiliate/find-creators"
              className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium inline-flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Tìm nhà sáng tạo
            </a>
            <button className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium inline-flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              Xem hướng dẫn
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Tăng độ tiếp cận</h3>
          <p className="text-sm text-gray-700">
            Kết nối với hàng ngàn nhà sáng tạo để mở rộng phạm vi tiếp cận sản phẩm
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
          <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Tăng doanh số</h3>
          <p className="text-sm text-gray-700">
            Nhà sáng tạo giúp tăng conversion rate thông qua nội dung chân thực
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <Gift className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Linh hoạt hoa hồng</h3>
          <p className="text-sm text-gray-700">
            Tự do thiết lập mức hoa hồng phù hợp với từng sản phẩm và chiến dịch
          </p>
        </div>
      </div>
    </div>
  );
}
