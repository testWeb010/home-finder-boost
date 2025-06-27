import React, { useEffect, useState } from "react";
import "./Team.css";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import { Link } from "react-router-dom";
import { Eye, ChevronLeft, ChevronRight, Trash } from "lucide-react";
import urlprovider from "../../utils/urlprovider";
import miniLogo from "../../assets/images/miniLogo.gif";

function TeamPage() {
  const [admins, setAdmins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminsPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getAdmins() {
      setIsLoading(true);
      try {
        const res = await axios({
          url: `${urlprovider()}/api/admin/get-all-admins`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        if (res.status === 200) {
          setAdmins(res.data.admins);
        }
      } catch (e) {
        console.log(e);
        toast.error("Error fetching team");
      } finally {
        setIsLoading(false);
      }
    }

    getAdmins();
  }, []);

  // Pagination logic
  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = admins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(admins.length / adminsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="d-team-page">
      <h1 className="d-page-title">Team Members</h1>
      <table className="d-admin-table">
        <thead>
          <tr>
            <th className="photo">Photo</th>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <div
              className="loader"
              style={{ display: isLoading ? "flex" : "none" }}
            >
              <img src={miniLogo} alt="logo" loading="lazy" />
            </div>
          ) : currentAdmins.length > 0 ? (
            currentAdmins.map((admin) => (
              <tr key={admin._id}>
                <td>
                  <img
                    className="d-admin-image"
                    src={admin.photo || "/user.webp"}
                    alt={admin.name}
                    onError={(e) => {
                      e.target.src = "/user.webp";
                    }}
                  />
                </td>
                <td>{admin.name || "Unknown"}</td>
                <td>@{admin.username}</td>
                <td>{admin.email}</td>
                <td className="u-actions">
                  <Link
                    to={`/profile/${admin._id}`}
                    className="d-btn u-edit-button"
                  >
                    <Eye className="d-icon" />
                  </Link>
                  <Link className="d-btn u-delete-button">
                    <Trash className="d-icon" />
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No team members found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Container */}
      <div className="o-pagination-container">
        <div className="o-pagination-info">
          <p>
            Showing{" "}
            <span className="o-pagination-highlight">
              {indexOfFirstAdmin + 1}
            </span>{" "}
            to{" "}
            <span className="o-pagination-highlight">
              {Math.min(indexOfLastAdmin, admins.length)}
            </span>{" "}
            of <span className="o-pagination-highlight">{admins.length}</span>{" "}
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
            disabled={currentPage === totalPages}
            className="o-pagination-button"
          >
            <ChevronRight className="o-chevron-icon" />
          </button>
        </nav>
      </div>
    </div>
  );
}

export default TeamPage;
