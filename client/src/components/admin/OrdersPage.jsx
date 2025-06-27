import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import "./Orders.css"; // Import the external CSS file
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import Modal from "react-modal";
import urlprovider from "../../utils/urlprovider";
import miniLogo from "../../assets/images/miniLogo.gif";

export default function OrdersPage() {
  const [orders, setOrders] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const handleCloseModal = () => setIsModalOpen(false);

  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders?.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredOrders?.length / ordersPerPage); i++) {
    pageNumbers.push(i);
  }

  useEffect(() => {
    async function getOrders() {
      try {
        setIsLoading(true);
        const res = await axios({
          url: `${urlprovider()}/api/admin/get-all-orders`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        if (res.status === 200) {
          setOrders(res.data.orders);
          setFilteredOrders(res.data.orders);
        }
      } catch (e) {
        console.log(e);
        toast.error("Error fetching orders");
      } finally {
        setIsLoading(false);
      }
    }
    getOrders();
  }, []);

  const filterOrders = (timeRange) => {
    setIsLoading(true);
    const now = new Date();
    let filtered;

    if (timeRange === "24hours") {
      const last24Hours = new Date(now);
      last24Hours.setHours(now.getHours() - 24);
      filtered = orders.filter((order) => new Date(order.time) >= last24Hours);
    } else if (timeRange === "7days") {
      const last7Days = new Date(now);
      last7Days.setDate(now.getDate() - 7);
      filtered = orders.filter((order) => new Date(order.time) >= last7Days);
    } else if (timeRange === "1month") {
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      filtered = orders.filter((order) => new Date(order.time) >= lastMonth);
    } else {
      filtered = orders; // Show all orders
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page after filtering
    setIsLoading(false);
  };

  const handleSearch = (event) => {
    setIsLoading(true);
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = orders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(query) ||
        order.txnId.toLowerCase().includes(query)
    );
    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page after searching
    setIsLoading(false);
  };

  return (
    <div className="o-orders-page space-y-6">
      <h2 className="o-heading">Orders</h2>
      {/* Search Bar */} {/* Filter Buttons */}
      <div className="topbar">
        <div className="o-search-bar">
          <input
            type="text"
            placeholder="Search by Order ID or Transaction ID"
            value={searchQuery}
            onChange={handleSearch}
            className="o-search-input"
          />
        </div>
        <div className="o-filter-buttons">
          <button onClick={() => filterOrders("24hours")}>Last 24 Hours</button>
          <button onClick={() => filterOrders("7days")}>Last 7 Days</button>
          <button onClick={() => filterOrders("1month")}>Last Month</button>
          <button onClick={() => filterOrders("all")}>All</button>
        </div>
      </div>
      <div className="o-table-container">
        <table className="o-table">
          <thead className="o-table-header">
            <tr>
              <th className="o-table-cell">Order ID</th>
              <th className="o-table-cell">Transaction ID</th>
              <th className="o-table-cell">Status</th>
              <th className="o-table-cell">User</th>
              <th className="o-table-cell">Plan</th>
              <th className="o-table-cell">Amount</th>
              <th className="o-table-cell">Date</th>
              <th className="o-table-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="o-table-body">
            { isLoading ? (
              <div
                className="loader"
                style={{ display: isLoading ? "flex" : "none" }}
              >
                <img src={miniLogo} alt="logo" loading="lazy" />
              </div>
            ) : filteredOrders != null && filteredOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr key={order._id}>
                  <td className="o-table-cell">{order.orderId}</td>
                  <td className="o-table-cell">{order.txnId}</td>
                  <td>
                    <span
                      className={`u-status-badge ${
                        order.success === true
                          ? "u-active-badge"
                          : "u-inactive-badge"
                      }`}
                    >
                      {order.success ? "Success" : "Failed"}
                    </span>
                  </td>
                  <td
                    className="o-table-cell"
                    style={{ textDecoration: "underline" }}
                  >
                    <Link to={`/profile/${order.user.userid}`}>
                      @{order.user?.username}
                    </Link>
                  </td>
                  <td className="o-table-cell">{order.plan?.planName}</td>
                  <td className="o-table-cell">₹{order.Amount?.toFixed(2)}</td>
                  <td className="o-table-cell">
                    {new Date(order.time).toLocaleDateString("en-GB")}
                  </td>
                  <td className="o-table-cell o-action-cell">
                    <button
                      className="o-eye-button"
                      onClick={() => {
                        setEditOrder(order);
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              "No orders found"
            )}
          </tbody>
        </table>
      </div>
      <div className="o-pagination-container">
        <div className="o-pagination-info">
          <p>
            Showing{" "}
            <span className="o-pagination-highlight">
              {indexOfFirstOrder + 1}
            </span>{" "}
            to{" "}
            <span className="o-pagination-highlight">
              {Math.min(indexOfLastOrder, filteredOrders?.length)}
            </span>{" "}
            of{" "}
            <span className="o-pagination-highlight">
              {filteredOrders?.length}
            </span>{" "}
            results
          </p>
        </div>
        <nav className="o-pagination-nav" aria-label="Pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="o-pagination-button"
          >
            <ChevronLeft className="o-chevron-icon" />
          </button>
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`o-pagination-page ${
                currentPage === number ? "o-active-page" : ""
              }`}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={
              currentPage === Math.ceil(filteredOrders?.length / ordersPerPage)
            }
            className="o-pagination-button"
          >
            <ChevronRight className="o-chevron-icon" />
          </button>
        </nav>
      </div>
      {/* Non-Editable Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Order Details"
        className="custom-modal"
        overlayClassName="custom-overlay"
      >
        <h2>Order Details</h2>
        {editOrder && (
          <div className="modal-content">
            <p>
              <strong>User:</strong> {editOrder.user.username}
            </p>
            <p>
              <strong>Plan:</strong> {editOrder.plan.planName}
            </p>
            <p>
              <strong>Transaction ID:</strong> {editOrder.txnId || "N/A"}
            </p>
            <p>
              <strong>Bank Reference:</strong>{" "}
              {editOrder.bankReference || "N/A"}
            </p>
            <p>
              <strong>Payment Mode:</strong>{" "}
              {editOrder.Mode ? `${editOrder.Mode} Transaction` : "N/A"}
            </p>
            <p>
              <strong>Amount:</strong> ₹{editOrder.Amount.toFixed(2)}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`u-status-badge ${
                  editOrder.success ? "u-active-badge" : "u-inactive-badge"
                }`}
              >
                {editOrder.success ? "Success" : "Failed"}
              </span>
            </p>
            <p>
              <strong>Order Date:</strong>{" "}
              {new Date(editOrder.time).toLocaleDateString("en-GB")}
            </p>
          </div>
        )}
        <button onClick={handleCloseModal} className="modal-close-button">
          Close
        </button>
      </Modal>
    </div>
  );
}
