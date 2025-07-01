import React, { useEffect, useState } from "react";
import { Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import "./User.css";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import urlprovider from "../../utils/urlprovider";
import miniLogo from "../../assets/images/miniLogo.gif";
import { Link } from "react-router-dom";

export default function UsersPage() {
  const [users, setUsers] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers?.slice(indexOfFirstUser, indexOfLastUser);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredUsers?.length / usersPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const [editUser, setEditUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (id) => {
    setEditUser(users.find((user) => user._id === id));
    setIsModalOpen(true);
  };

  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const handleDelete = (id) => {
    setDeleteUser(users.find((user) => user._id === id));
    setDeleteConfirmationOpen(true);
  };

  async function getUser() {
    try {
      setIsLoading(true);
      const res = await axios({
        url: `${urlprovider()}/api/admin/get-all-user`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (res.status === 200) {
        // Sort users by createdAt date in descending order (newest first)
        const sortedUsers = res.data.Allusers.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      }
    } catch (e) {
      console.log(e);
      toast.error("Error fetching users");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    if (!users) return;

    let filtered = users.filter((user) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && user.isVerified === true) ||
        (filter === "inactive" && user.isVerified === false);

      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    // Sort filtered users by createdAt date
    filtered = filtered.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
    setIsLoading(false);
  }, [filter, users, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await axios({
        url: `${urlprovider()}/api/admin/update-user-by-id/${editUser._id}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        data: {
          name: editUser.name,
          role: editUser.role,
          isVerified: editUser.isVerified,
          accountStatus: editUser.accountStatus,
        },
      });
      if (res.status === 200) {
        toast.success("User updated successfully");
        getUser();
        setIsModalOpen(false);
        setIsLoading(false);
      }
    } catch (e) {
      console.log(e);
      toast.error("Error updating user");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await axios({
        url: `${urlprovider()}/api/admin/delete-user-by-id/${deleteUser._id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (res.status === 200) {
        toast.success("User deleted successfully");
        getUser();
        setDeleteConfirmationOpen(false);
      }
    } catch (e) {
      console.log(e);
      toast.error("Error deleting user");
    }
  };

  return (
    <div className="u-container">
      <div className="u-header">
        <h2 className="u-title">Users</h2>
        <input
          type="text"
          placeholder="Search by name, username, or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            margin: "0 20px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <div className="u-filter-buttons">
          <button
            className={`u-filter-button ${filter === "all" ? "u-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`u-filter-button ${
              filter === "active" ? "u-active" : ""
            }`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={`u-filter-button ${
              filter === "inactive" ? "u-active" : ""
            }`}
            onClick={() => setFilter("inactive")}
          >
            Inactive
          </button>
        </div>
      </div>
      <div className="u-table-container">
        <table className="u-table">
          <thead className="u-table-header">
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Account Type</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="u-table-body">
            { isLoading ? (
              <div
                className="loader"
                style={{ display: isLoading ? "flex" : "none" }}
              >
              <img src={miniLogo} alt="logo" loading="lazy" />
                </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || "No name"}</td>
                  <Link
                    to={`/profile/${user._id}`}
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                  >
                    @{user.username}
                  </Link>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.accountType}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "5px",
                        backgroundColor: user.isVerified
                          ? "#d4edda"
                          : "#f8d7da",
                        color: user.isVerified ? "#155724" : "#721c24",
                      }}
                    >
                      {user.isVerified ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="u-actions">
                    <button
                      onClick={() => handleEdit(user._id)}
                      className="u-edit-button"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="u-delete-button"
                    >
                      <Trash size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            width: "fit-content",
            height: "fit-content",
            backgroundColor: "#f0f0f0",
            border: "none",
            padding: "8px 12px",
            marginRight: "5px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          <ChevronLeft size={15} />
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            style={{
              backgroundColor: currentPage === number ? "#10b981" : "#f0f0f0",
              color: currentPage === number ? "white" : "black",
              border: "none",
              padding: "8px 12px",
              margin: "0 5px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === pageNumbers.length}
          style={{
            width: "fit-content",
            height: "fit-content",
            backgroundColor: "#f0f0f0",
            border: "none",
            padding: "8px 12px",
            marginLeft: "5px",
            cursor:
              currentPage === pageNumbers.length ? "not-allowed" : "pointer",
          }}
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Edit User Modal */}
      {isModalOpen && (
        <div className="u-modal">
          <div className="u-modal-content">
            <h2>Edit User</h2>
            <form>
              <p>Name</p>
              <input type="text" placeholder="Name" value={editUser?.name} onChange={(e)=>setEditUser({...editUser, name: e.target.value})} />
              <p>Role</p>
              <select
                value={editUser.role}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: e.target.value })
                }
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <p>Account Verified</p>
              <select
                value={editUser.isVerified}
                onChange={(e) =>
                  setEditUser({ ...editUser, isVerified: e.target.value })
                }
              >
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
              <p>Account status</p>
              <select
                value={editUser.accountStatus}
                onChange={(e) =>
                  setEditUser({ ...editUser, accountStatus: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                type="submit"
                onClick={(e) => {
                  handleSubmit(e);
                }}
              >
                Save
              </button>
            </form>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationOpen && (
        <div className="u-modal">
          <div className="u-modal-content">
            <h2>Delete User</h2>
            <p>Are you sure you want to delete this user?</p>
            <button
              style={{ backgroundColor: "red", color: "#fff" }}
              onClick={handleDeleteConfirm}
            >
              Yes
            </button>
            <button
              onClick={() => setDeleteConfirmationOpen(false)}
              style={{ backgroundColor: "#c9c9c9", color: "black" }}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
