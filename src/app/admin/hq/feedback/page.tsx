"use client";

import { useState, useEffect } from "react";

interface Feedback {
  id: number;
  storeId: number;
  tableNo: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function HqFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/feedback?page=${p}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks);
        setTotal(data.total);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-gray-900">고객 의견</h1>
          <p className="text-xs text-gray-500">전체 매장에서 접수된 고객 의견 ({total}건)</p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-red-600" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-gray-200 bg-white">
            <p className="text-sm text-gray-400">접수된 의견이 없습니다</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 whitespace-pre-line leading-relaxed">{fb.content}</p>
                  </div>
                  {!fb.isRead && (
                    <span className="flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">NEW</span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400">
                  <span>매장 #{fb.storeId}</span>
                  <span>·</span>
                  <span>{fb.tableNo}번 테이블</span>
                  <span>·</span>
                  <span>{new Date(fb.createdAt).toLocaleString("ko-KR")}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 disabled:opacity-30"
            >
              이전
            </button>
            <span className="text-xs text-gray-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 disabled:opacity-30"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
