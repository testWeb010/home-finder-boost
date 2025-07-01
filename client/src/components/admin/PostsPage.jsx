import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import "./Posts.css";
import { Edit, Trash, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "react-modal";
import toast from "react-hot-toast";
import urlprovider from "../../utils/urlprovider";
import miniLogo from "../../assets/images/miniLogo.gif";

Modal.setAppElement("#root"); // Set the root element for accessibility

function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);
  const [editPost, setEditPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    async function getPosts() {
      try {
        setIsLoading(true);
        const res = await axios({
          url: `${urlprovider()}/api/admin/get-all-posts`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        if (res.status === 200) {
          setPosts(res.data.posts);
        }
      } catch (e) {
        console.log(e);
        toast.error("Error fetching posts");
      } finally {
        setIsLoading(false);
      }
    }
    getPosts();
  }, []);

  // Filtering logic based on the search term
  const filteredPosts = posts.filter((post) => {
    const nameMatch = post.propertyName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const filterMatch =
      filter === "all"
        ? true
        : filter === "verified"
        ? post.isVerified
        : filter === "unverified"
        ? !post.isVerified
        : true;
    return nameMatch && filterMatch;
  });

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const pageNumbers = [...Array(totalPages).keys()].map((i) => i + 1);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (post) => {
    setEditPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditPost(null);
  };

  const handleViewPost = (post) => {
    navigate(`/property/${post._id}`);
  };

  // const handleSaveChanges = async () => {
  //   try {
  //     const res = await axios({
  //       url: `${urlprovider()}/api/admin/update-post/${editPost._id}`,
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${Cookies.get("token")}`,
  //       },
  //       data: editPost,
  //     });
  //     if (res.status === 200) {
  //       toast.success("Changes saved successfully");
  //       setPosts(
  //         posts.map((post) => (post._id === editPost._id ? editPost : post))
  //       );
  //       handleCloseModal();
  //     } else {
  //       toast.error("Error saving changes");
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     toast.error("Error saving changes");
  //   }
  // };

  const changeVerify = async () => {
    try {
      const res = await axios({
        url: `${urlprovider()}/api/admin/update-post/${editPost._id}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        data: editPost,
      });
      if (res.status === 200) {
        toast.success("Changes saved successfully");
        setPosts(
          posts.map((post) => (post._id === editPost._id ? editPost : post))
        );
        handleCloseModal();
      } else {
        toast.error("Error saving changes");
      }
    } catch (e) {
      console.log(e);
      toast.error("Error saving changes");
    }
  };

  const handleDelete = (post) => {
    setPostToDelete(post);
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      const res = await axios({
        url: `${urlprovider()}/api/admin/delete-post-by-id/${postToDelete._id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (res.status === 200) {
        setPosts(posts.filter((post) => post._id !== postToDelete._id));
        toast.success("Post deleted successfully");
        setIsConfirmDeleteModalOpen(false);
      } else {
        toast.error("Error deleting post");
      }
    } catch (e) {
      console.log(e);
      toast.error("Error deleting post");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="o-orders-page space-y-6">
      <h2 className="o-heading">Posts</h2>
      <div className="o-search-filter-container">
        <input
          type="text"
          placeholder="Search by Property Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="o-search-input"
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
              filter === "verified" ? "u-active" : ""
            }`}
            onClick={() => setFilter("verified")}
          >
            Verified
          </button>
          <button
            className={`u-filter-button ${
              filter === "unverified" ? "u-active" : ""
            }`}
            onClick={() => setFilter("unverified")}
          >
            Unverified
          </button>
        </div>
      </div>
      {isLoading ? (
        <div
          className="loader"
          style={{ display: isLoading ? "flex" : "none" }}
        >
          <img src={miniLogo} alt="logo" loading="lazy" />
        </div>
      ) : (
        <>
          <div className="o-table-container">
            <table className="o-table">
              <thead className="o-table-header">
                <tr>
                  <th className="o-table-cell">No.</th>
                  <th className="o-table-cell name">Property Name</th>
                  <th className="o-table-cell">Property Type</th>
                  <th className="o-table-cell des">Description</th>
                  <th className="o-table-cell">Verified</th>
                  <th className="o-table-cell">User</th>
                  <th className="o-table-cell">Contact</th>
                  <th className="o-table-cell">Date</th>
                  <th className="o-table-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPosts.map((post, index) => (
                  <tr key={post._id} className="o-table-row">
                    <td className="o-table-cell">
                      {indexOfFirstPost + index + 1}
                    </td>
                    <td className="o-table-cell name" title={post.propertyName}>
                      {post.propertyName}
                    </td>
                    <td className="o-table-cell">{post.propertyType}</td>
                    <td className="o-table-cell des" title={post.description}>
                      {post.description}
                    </td>
                    <td className="o-table-cell">
                      {post.isVerified ? "Yes" : "No"}
                    </td>
                    <td className="o-table-cell">
                      <Link
                        to={`/profile/${post.user?._id}`}
                        style={{ textDecoration: "underline" }}
                      >
                        @{post.user?.username}
                      </Link>
                    </td>
                    <td className="o-table-cell">{post.mobile}</td>
                    <td className="o-table-cell">
                      {new Date(post.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="u-actions">
                      <button
                        onClick={() => handleViewPost(post)}
                        className="u-edit-button"
                        title="View Post"
                      >
                        <Eye size={20} />
                      </button>

                      <button
                        onClick={() => handleEdit(post)}
                        className="u-edit-button"
                        title="Edit Post"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={deleting}
                        className="u-delete-button"
                        title="Delete Post"
                      >
                        <Trash size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="o-pagination-container">
            <div className="o-pagination-info">
              <p>
                Showing{" "}
                <span className="o-pagination-highlight">
                  {indexOfFirstPost + 1}
                </span>{" "}
                to{" "}
                <span className="o-pagination-highlight">
                  {Math.min(indexOfLastPost, posts.length)}
                </span>{" "}
                of{" "}
                <span className="o-pagination-highlight">{posts.length}</span>{" "}
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
        </>
      )}

      {/* Edit Modal */}
      {editPost && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          className="modal-content edit-post"
          overlayClassName="modal-overlay"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p>Verified</p>
            <select
              name="Post Verified"
              value={editPost.isVerified.toString()} // Ensure value is string
              onChange={(e) =>
                setEditPost({
                  ...editPost,
                  isVerified: e.target.value === "true", // Convert to boolean
                })
              }
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                width: "150px",
                marginBottom: "0px",
              }}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <button
            style={{
              backgroundColor: "#10b981",
              color: "white",
              borderRadius: "5px",
            }}
            onClick={changeVerify}
          >
            Save
          </button>
          <button
            onClick={handleCloseModal}
            style={{ backgroundColor: "#edebeb", borderRadius: "5px" }}
          >
            Cancel
          </button>
        </Modal>
      )}
      {/* <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>Edit Post</h2>
        {editPost && (
          <form onSubmit={handleSaveChanges} className="edit-post">
            <p>Property Name</p>
            <input
              type="text"
              value={editPost.propertyName}
              onChange={(e) =>
                setEditPost({ ...editPost, propertyName: e.target.value })
              }
              placeholder="Property Name"
              required
            />
            <p>City</p>
            <input
              type="text"
              value={editPost.city}
              onChange={(e) =>
                setEditPost({ ...editPost, city: e.target.value })
              }
              placeholder="City"
              required
            />
            <p>Pincode</p>
            <input
              type="number"
              value={editPost.pincode}
              onChange={(e) =>
                setEditPost({ ...editPost, pincode: e.target.value })
              }
              placeholder="Pincode"
              required
            />
            <p>Total Rooms</p>
            <input
              type="number"
              value={editPost.totalRooms}
              onChange={(e) =>
                setEditPost({ ...editPost, totalRooms: e.target.value })
              }
              placeholder="Total Rooms"
            />
            <p>Total Rent</p>
            <input
              type="number"
              value={editPost.totalRent}
              onChange={(e) =>
                setEditPost({ ...editPost, totalRent: e.target.value })
              }
              placeholder="Total Rent"
              required
            />
            <label>
              Electricity Included:
              <input
                type="checkbox"
                checked={editPost.electricityIncluded}
                onChange={(e) =>
                  setEditPost({
                    ...editPost,
                    electricityIncluded: e.target.checked,
                  })
                }
              />
            </label>
            <label>
              Kitchen (0: Personal, 1: Shared):
              <select
                value={editPost.kitchen[0] ? "personal" : "shared"}
                onChange={(e) =>
                  setEditPost({
                    ...editPost,
                    kitchen: [
                      e.target.value === "personal",
                      editPost.kitchen[1],
                    ],
                  })
                }
              >
                <option value="personal">Personal</option>
                <option value="shared">Shared</option>
              </select>
            </label>
            <label>
              Washroom (0: Personal, 1: Shared):
              <select
                value={editPost.washroom[0] ? "personal" : "shared"}
                onChange={(e) =>
                  setEditPost({
                    ...editPost,
                    washroom: [
                      e.target.value === "personal",
                      editPost.washroom[1],
                    ],
                  })
                }
              >
                <option value="personal">Personal</option>
                <option value="shared">Shared</option>
              </select>
            </label>
            <label>
              Can Smoke:
              <input
                type="checkbox"
                checked={editPost.canSmoke}
                onChange={(e) =>
                  setEditPost({ ...editPost, canSmoke: e.target.checked })
                }
              />
            </label>
            <label>
              Is Independent:
              <input
                type="checkbox"
                checked={editPost.isIndependent}
                onChange={(e) =>
                  setEditPost({ ...editPost, isIndependent: e.target.checked })
                }
              />
            </label>
            <p>Total Members</p>
            <input
              type="number"
              value={editPost.capacity}
              onChange={(e) =>
                setEditPost({ ...editPost, capacity: e.target.value })
              }
              placeholder="Capacity"
              required
            />
            <p>Mobile</p>
            <input
              type="text"
              value={editPost.mobile}
              onChange={(e) =>
                setEditPost({ ...editPost, mobile: e.target.value })
              }
              placeholder="Mobile"
              required
            />
            <label>
              Need Roommate:
              <input
                type="checkbox"
                checked={editPost.needRoommate}
                onChange={(e) =>
                  setEditPost({ ...editPost, needRoommate: e.target.checked })
                }
              />
            </label>
            <p>About Roommate</p>
            <textarea
              value={editPost.aboutRoommate}
              onChange={(e) =>
                setEditPost({ ...editPost, aboutRoommate: e.target.value })
              }
              placeholder="About Roommate"
            />
            <p>Security Money</p>
            <input
              type="number"
              value={editPost.securityMoney}
              onChange={(e) =>
                setEditPost({ ...editPost, securityMoney: e.target.value })
              }
              placeholder="Security Money"
              required
            />
            <label>
              Preferred Gender:
              <select
                value={editPost.preferedGender}
                onChange={(e) =>
                  setEditPost({ ...editPost, preferedGender: e.target.value })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="any">Any</option>
              </select>
            </label>
            <label>
              Property Type:
              <select
                value={editPost.propertyType}
                onChange={(e) =>
                  setEditPost({ ...editPost, propertyType: e.target.value })
                }
              >
                <option value="apartment">Apartment</option>
                <option value="pg">PG</option>
                <option value="singleroom">Single Room</option>
              </select>
            </label>
            <p>Description</p>
            <textarea
              value={editPost.description}
              onChange={(e) =>
                setEditPost({ ...editPost, description: e.target.value })
              }
              placeholder="Description"
            />
            <div className="modal-buttons">
              <button
                type="button"
                className="close-btn"
                onClick={handleCloseModal}
              >
                Close
              </button>
              <button type="submit" className="confirm-btn">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal> */}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isConfirmDeleteModalOpen}
        onRequestClose={() => setIsConfirmDeleteModalOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this post?</p>
        <div className="modal-buttons">
          <button className="confirm-btn" onClick={confirmDelete}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <button
            className="cancel-btn1"
            onClick={() => setIsConfirmDeleteModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default PostsPage;
