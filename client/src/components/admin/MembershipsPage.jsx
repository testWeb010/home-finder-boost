import React, { useEffect, useState } from "react";
import { Edit, Check, X } from "lucide-react";
import "./Memberships.css";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import urlprovider from "../../utils/urlprovider";
import miniLogo from "../../assets/images/miniLogo.gif";

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (membership) => {
    setEditingId(membership._id);
    setEditValues(membership);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const res = await axios({
        url: `${urlprovider()}/api/admin/update-memberships/${editValues._id}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        data: {
          originalPrice: editValues.originalPrice,
          discountedPrice: editValues.discountedPrice,
        },
      });
      if (res.status === 200) {
        toast.success("Membership updated successfully");
      }
    } catch (e) {
      console.log(e);
      toast.error("Error updating membership");
    } finally {
      setMemberships(
        memberships.map((m) =>
          m._id === editingId ? { ...m, ...editValues } : m
        )
      );
      setEditingId(null);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleChange = (e, field) => {
    setEditValues({ ...editValues, [field]: parseFloat(e.target.value) });
  };

  useEffect(() => {
    async function getMemberships() {
      try {
        setIsLoading(true);
        const res = await axios({
          url: `${urlprovider()}/api/admin/get-all-memberships`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        if (res.status === 200) {
          console.log(res.data);
          setMemberships(res.data.memberships);
        }
      } catch (e) {
        console.log(e);
        toast.error("Error fetching memberships");
      } finally {
        setIsLoading(false);
      }
    }

    getMemberships();
  }, []);

  return (
    <div className="m container">
      <h2>Memberships</h2>
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="table-header">
            <tr>
              <th>Name</th>
              <th>Features</th>
              <th>Original Price</th>
              <th>Discounted Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {isLoading ? (
              <div
                className="loader"
                style={{ display: isLoading ? "flex" : "none" }}
              >
                <img src={miniLogo} alt="logo" loading="lazy" />
              </div>
            ) : memberships != null ? (
              memberships.map((membership) => (
                <tr key={membership._id}>
                  <td>{membership.planName}</td>
                  <td>
                    {membership.features.map((feature, index) => (
                      <p key={index}>- {feature}</p>
                    ))}
                  </td>
                  <td>
                    {editingId === membership._id ? (
                      <input
                        type="number"
                        value={editValues.originalPrice}
                        onChange={(e) => handleChange(e, "originalPrice")}
                        className="edit-input"
                      />
                    ) : (
                      `₹${membership.originalPrice.toFixed(2)}`
                    )}
                  </td>
                  <td>
                    {editingId === membership._id ? (
                      <input
                        type="number"
                        value={editValues.discountedPrice}
                        onChange={(e) => handleChange(e, "discountedPrice")}
                        className="edit-input"
                      />
                    ) : (
                      `₹${membership.discountedPrice.toFixed(2)}`
                    )}
                  </td>
                  <td>
                    {editingId === membership._id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="action-button text-green-600 hover:text-green-900"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="action-button text-red-600 hover:text-red-900"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(membership)}
                        className="action-button text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={20} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>No memberships found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
