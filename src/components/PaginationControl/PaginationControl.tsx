import { Pagination } from "antd";
import "./PaginationControl.css";
export default function PaginationControl({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
}: {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
}) {
  return (
    <div
      style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
    >
      <Pagination
        className="custom-pagination"
        current={currentPage}
        pageSize={pageSize}
        total={totalCount}
        onChange={onPageChange}
        showSizeChanger={true}
        pageSizeOptions={["5", "10", "20", "50", "100", "200", "500"]}
      />
    </div>
  );
}
