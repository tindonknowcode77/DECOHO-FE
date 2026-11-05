"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FileUp,
  LoaderCircle,
  MousePointerClick,
  Percent,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Upload,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authenticatedFetch } from "@/src/features/auth/services/authenticatedFetch";

interface AdminOverviewData {
  totalClicks: number;
  totalOrders: number;
  totalGMV: number;
  totalCommission: number;
  claimedCount: number;
  unclaimedCount: number;
  conversionRate: number;
  recentOrders: Array<{
    _id: string;
    orderId: string;
    conversionId: string;
    itemName: string;
    shopName: string;
    orderStatus: string;
    orderTime: string;
    purchaseValue: number;
    commission: number;
    isClaimed: boolean;
    userId?: {
      _id: string;
      fullName?: string;
      email?: string;
    };
  }>;
}

export default function AdminAffiliatePage() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State quản lý upload 2 file CSV
  const [clickFile, setClickFile] = useState<File | null>(null);
  const [commissionFile, setCommissionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
      const res = await authenticatedFetch(`${baseUrl}/affiliate/admin-overview`);
      if (!res.ok) {
        throw new Error(`Máy chủ trả về ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err: any) {
      toast.error("Không thể tải dữ liệu Affiliate", { description: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOverview();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickFile && !commissionFile) {
      toast.warning("Vui lòng chọn ít nhất 1 file CSV để tải lên.");
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      if (clickFile) formData.append("clickReport", clickFile);
      if (commissionFile) formData.append("commissionReport", commissionFile);

      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
      const res = await authenticatedFetch(`${baseUrl}/affiliate/upload-reports`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Xử lý file thất bại");
      }

      setUploadResult(json.data);
      toast.success("Tải lên và xử lý báo cáo Shopee thành công!", {
        description: `Đã cập nhật dữ liệu đơn hàng và lượt click.`,
      });

      // Reset file inputs và tải lại dữ liệu mới nhất
      setClickFile(null);
      setCommissionFile(null);
      fetchOverview();
    } catch (err: any) {
      toast.error("Lỗi khi tải file báo cáo", { description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("completed") || s.includes("thành công") || s.includes("settled")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5ec] px-2.5 py-1 text-xs font-bold text-[#237042]">
          <CheckCircle2 size={12} />
          Hoàn thành
        </span>
      );
    }
    if (s.includes("cancelled") || s.includes("hủy") || s.includes("failed")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf2f0] px-2.5 py-1 text-xs font-bold text-[#a34131]">
          <XCircle size={12} />
          Đã hủy
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#fef8e8] px-2.5 py-1 text-xs font-bold text-[#a8741a]">
        <Clock size={12} />
        {status}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ded6c9] bg-[#f2efe6] px-3 py-1 text-xs font-bold text-[#2e6f5e]">
            <TrendingUp size={14} />
            <span>Shopee Affiliate Engine</span>
          </div>
          <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#254f43] sm:text-3xl">
            Quản Trị Shopee Affiliate
          </h1>
          <p className="mt-1 text-xs text-[#646a61]">
            Nhập báo cáo doanh số, theo dõi hoa hồng và tỷ lệ chuyển đổi đơn hàng DECOHO
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-[#ded6c9] bg-white px-4 py-2.5 text-xs font-bold text-[#254f43] shadow-xs transition hover:bg-[#fbf9f4] active:scale-95 disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-[#2e6f5e]" : ""} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {/* Card 1: Tổng Click */}
        <div className="rounded-2xl border border-[#ded6c9] bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
              Tổng Lượt Click
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#eef2e7] text-[#2e6f5e]">
              <MousePointerClick size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-[#254f43]">
            {loading ? "..." : (data?.totalClicks ?? 0).toLocaleString("vi-VN")}
          </p>
          <p className="mt-1 text-[11px] text-[#708164]">Từ link tiếp thị Shopee</p>
        </div>

        {/* Card 2: Tổng Đơn hàng */}
        <div className="rounded-2xl border border-[#ded6c9] bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
              Tổng Số Đơn
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#dfe8d3] text-[#2e6f5e]">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-[#254f43]">
            {loading ? "..." : (data?.totalOrders ?? 0).toLocaleString("vi-VN")}
          </p>
          <p className="mt-1 text-[11px] text-[#708164]">
            Đã nhận: <strong className="text-[#2e6f5e]">{data?.claimedCount ?? 0}</strong> đơn
          </p>
        </div>

        {/* Card 3: Doanh số (GMV) */}
        <div className="rounded-2xl border border-[#ded6c9] bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
              Doanh Số (GMV)
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#e8f1ec] text-[#2e6f5e]">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-[#254f43]">
            {loading ? "..." : `${Math.round(data?.totalGMV ?? 0).toLocaleString("vi-VN")} ₫`}
          </p>
          <p className="mt-1 text-[11px] text-[#708164]">Tổng giá trị đơn mua</p>
        </div>

        {/* Card 4: Tổng Hoa Hồng */}
        <div className="rounded-2xl border border-[#ded6c9] bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2e6f5e]">
              Tổng Hoa Hồng
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#2e6f5e] text-white">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-[#2e6f5e]">
            {loading ? "..." : `${Math.round(data?.totalCommission ?? 0).toLocaleString("vi-VN")} ₫`}
          </p>
          <p className="mt-1 text-[11px] text-[#708164]">Net Commission tích lũy</p>
        </div>

        {/* Card 5: Tỷ Lệ Chuyển Đổi (CR) */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#ded6c9] bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
              Tỷ Lệ Chuyển Đổi
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#f5efe3] text-[#9f663d]">
              <Percent size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-[#9f663d]">
            {loading ? "..." : `${data?.conversionRate ?? 0}%`}
          </p>
          <p className="mt-1 text-[11px] text-[#708164]">Đơn hàng / Lượt click</p>
        </div>
      </div>

      {/* Khu vực Upload Báo cáo Shopee CSV */}
      <div className="mt-8 rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2e7] text-[#2e6f5e]">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#254f43]">
              Nhập Báo Cáo CSV Từ Shopee Affiliate
            </h2>
            <p className="text-xs text-[#708164]">
              Tải lên trực tiếp 2 file CSV gốc xuất từ trang đối tác Shopee để hệ thống tự động bóc tách và phân bổ
            </p>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
          {/* File 1: WebsiteClickReport */}
          <div className="rounded-2xl border-2 border-dashed border-[#ded6c9] bg-[#fbf9f4] p-5 transition hover:border-[#2e6f5e] hover:bg-[#f7f3ec]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#f2efe6] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#708164]">
                File 1 (Tùy chọn)
              </span>
              {clickFile && (
                <span className="text-xs font-bold text-[#2e6f5e]">Đã chọn file ✓</span>
              )}
            </div>
            <h3 className="mt-2 text-sm font-bold text-[#254f43]">
              WebsiteClickReport.csv
            </h3>
            <p className="mt-1 text-[11px] text-[#80897b]">
              Báo cáo lượt click, Sub_id và nguồn giới thiệu
            </p>

            <input
              type="file"
              accept=".csv"
              id="clickReportInput"
              onChange={(e) => setClickFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label
              htmlFor="clickReportInput"
              className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#ded6c9] bg-white px-4 py-2.5 text-xs font-bold text-[#254f43] transition hover:bg-[#f0ede4]"
            >
              <FileUp size={14} className="text-[#2e6f5e]" />
              <span>{clickFile ? clickFile.name : "Chọn file Click Report"}</span>
            </label>
          </div>

          {/* File 2: AffiliateCommissionReport */}
          <div className="rounded-2xl border-2 border-dashed border-[#ded6c9] bg-[#fbf9f4] p-5 transition hover:border-[#2e6f5e] hover:bg-[#f7f3ec]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#e8f1ec] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2e6f5e]">
                File 2 (Khuyến nghị)
              </span>
              {commissionFile && (
                <span className="text-xs font-bold text-[#2e6f5e]">Đã chọn file ✓</span>
              )}
            </div>
            <h3 className="mt-2 text-sm font-bold text-[#254f43]">
              AffiliateCommissionReport.csv
            </h3>
            <p className="mt-1 text-[11px] text-[#80897b]">
              Báo cáo chi tiết đơn hàng, mã đơn, sản phẩm và hoa hồng
            </p>

            <input
              type="file"
              accept=".csv"
              id="commissionReportInput"
              onChange={(e) => setCommissionFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label
              htmlFor="commissionReportInput"
              className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#ded6c9] bg-white px-4 py-2.5 text-xs font-bold text-[#254f43] transition hover:bg-[#f0ede4]"
            >
              <FileUp size={14} className="text-[#2e6f5e]" />
              <span>{commissionFile ? commissionFile.name : "Chọn file Commission Report"}</span>
            </label>
          </div>

          {/* Submit button */}
          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={uploading || (!clickFile && !commissionFile)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2e6f5e] px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#245747] active:scale-95 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" />
                  <span>Đang xử lý dữ liệu CSV...</span>
                </>
              ) : (
                <>
                  <Upload size={15} />
                  <span>Tiến hành nhập dữ liệu</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Kết quả sau khi upload */}
        {uploadResult && (
          <div className="mt-5 rounded-2xl border border-[#ded6c9] bg-[#f0f6f3] p-4 text-xs">
            <h4 className="font-bold text-[#2e6f5e]">Kết quả xử lý báo cáo:</h4>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {uploadResult.commissions && (
                <div className="rounded-xl bg-white p-3 border border-[#ded6c9]/60">
                  <p className="font-bold text-[#254f43]">Báo cáo Hoa hồng:</p>
                  <p className="text-[#646a61]">Tổng dòng đọc được: {uploadResult.commissions.totalRows}</p>
                  <p className="text-[#2e6f5e] font-semibold">Đơn mới thêm: {uploadResult.commissions.upsertedCount}</p>
                  <p className="text-[#2e6f5e] font-semibold">Tự động gán User: {uploadResult.commissions.autoClaimedCount}</p>
                </div>
              )}
              {uploadResult.clicks && (
                <div className="rounded-xl bg-white p-3 border border-[#ded6c9]/60">
                  <p className="font-bold text-[#254f43]">Báo cáo Lượt Click:</p>
                  <p className="text-[#646a61]">Tổng dòng đọc được: {uploadResult.clicks.totalRows}</p>
                  <p className="text-[#2e6f5e] font-semibold">Click mới thêm: {uploadResult.clicks.upsertedCount}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bảng Đơn Hàng Shopee Mới Nhất */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-[#ded6c9] bg-white shadow-sm">
        <div className="border-b border-[#ded6c9] px-6 py-5">
          <h2 className="font-serif text-lg font-bold text-[#254f43]">
            Danh Sách Đơn Hàng Shopee Gần Đây
          </h2>
          <p className="text-xs text-[#708164]">
            Theo dõi tình trạng đơn hàng, hoa hồng và tài khoản người dùng được ghi nhận
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#ded6c9] bg-[#fbf9f4] text-[11px] font-bold uppercase tracking-wider text-[#708164]">
              <tr>
                <th className="px-6 py-3.5">Mã Đơn / Conversion</th>
                <th className="px-6 py-3.5">Sản Phẩm</th>
                <th className="px-6 py-3.5">Trạng Thái</th>
                <th className="px-6 py-3.5">Giá Trị Đơn</th>
                <th className="px-6 py-3.5">Hoa Hồng</th>
                <th className="px-6 py-3.5">Người Nhận</th>
                <th className="px-6 py-3.5">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded6c9]/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#708164]">
                    <div className="inline-flex items-center gap-2">
                      <LoaderCircle size={16} className="animate-spin text-[#2e6f5e]" />
                      <span>Đang tải danh sách đơn hàng...</span>
                    </div>
                  </td>
                </tr>
              ) : !data?.recentOrders?.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#708164]">
                    Chưa có đơn hàng Shopee nào được nhập. Hãy tải lên file báo cáo CSV bên trên.
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((ord) => (
                  <tr key={ord._id} className="transition hover:bg-[#fbf9f4]">
                    <td className="px-6 py-4 font-mono font-bold text-[#254f43]">
                      <div>{ord.orderId}</div>
                      <div className="text-[10px] font-normal text-[#80897b] truncate max-w-[120px]">
                        {ord.conversionId}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="truncate font-bold text-[#254f43]" title={ord.itemName}>
                        {ord.itemName}
                      </div>
                      <div className="text-[11px] text-[#708164] truncate">
                        {ord.shopName || "Shopee Mall / Shop"}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(ord.orderStatus)}</td>
                    <td className="px-6 py-4 font-semibold text-[#254f43]">
                      {ord.purchaseValue?.toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-6 py-4 font-bold text-[#2e6f5e]">
                      +{ord.commission?.toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-6 py-4">
                      {ord.isClaimed && ord.userId ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f6f3] px-2.5 py-1 text-[11px] font-bold text-[#2e6f5e]">
                          <UserCheck size={12} />
                          <span className="truncate max-w-[110px]">
                            {ord.userId.fullName || ord.userId.email || "Đã nhận"}
                          </span>
                        </div>
                      ) : (
                        <span className="rounded-full bg-[#f2efe6] px-2.5 py-1 text-[11px] font-medium text-[#708164]">
                          Chưa có người nhận
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#708164]">
                      {ord.orderTime ? new Date(ord.orderTime).toLocaleDateString("vi-VN") : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

