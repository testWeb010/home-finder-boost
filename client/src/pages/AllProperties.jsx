import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import "./css/AllProperties.css";
import PropertyCardAll from "../components/cards/PropertyCardAll";
import ReactPaginate from "react-paginate";
import Footer from "../components/footer/Footer";
import miniLogo from "../assets/images/miniLogo.gif";
import urlprovider from "../utils/urlprovider";

function AllProperties() {
  const navigate = useNavigate();
  const params = useParams();
  const [location, setLocation] = useState(params.location || "");
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 10;
  const [filters, setFilters] = useState({
    propertyType: "",
    gender: "",
    bedrooms: "",
    pricerange: "",
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      async function fetchProperties() {
        setLoading(true);
        try {
          const res = await axios.get(
            `${urlprovider()}/api/post/get-post-by-location/${location}`,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("token")}`,
              },
            }
          );

          if (res.status === 200) {
            setProperties(res.data.posts);
            applyFilters(res.data.posts); // Apply filters initially
          } else {
            toast.error("Something went wrong");
          }
        } catch (err) {
          console.log(err);
          if (err.response && err.response.status === 401) {
            toast.error("Login Required");
            navigate("/");
          } else {
            toast.error(err.response ? err.response.data.message : err.message);
          }
        } finally {
          setLoading(false);
        }
      }

      fetchProperties();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [location]);

  const handleSearch = (e) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
  };

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [name]: value };
      applyFilters(properties, updatedFilters);
      return updatedFilters;
    });
  };

  const applyFilters = (propertyList, filters) => {
    let filtered = propertyList;

    if (filters?.propertyType) {
      filtered = filtered.filter((property) =>
        property.propertyType
          .toLowerCase()
          .includes(filters.propertyType.toLowerCase())
      );
    }

    if (filters?.gender) {
      filtered = filtered.filter(
        (property) =>
          property.preferedGender.toLowerCase() == filters.gender.toLowerCase()
      );
    }

    if (filters?.bedrooms) {
      filtered = filtered.filter((property) => {
        if (property.totalRooms === undefined)
          return parseInt(filters.bedrooms) === 1;
        else if (parseInt(filters.bedrooms) === 5)
          return property.totalRooms >= parseInt(filters.bedrooms);
        else return property.totalRooms === parseInt(filters.bedrooms);
      });
    }

    if (filters?.pricerange) {
      const [minPrice, maxPrice] = filters.pricerange.split("-");
      if (maxPrice == "infinite") {
        filtered = filtered.filter(
          (property) => property.totalRent >= parseInt(minPrice)
        );
      } else {
        filtered = filtered.filter(
          (property) =>
            property.totalRent >= parseInt(minPrice) &&
            property.totalRent <= parseInt(maxPrice)
        );
      }
    }

    setFilteredProperties(filtered);
  };

  const clearFilters = () => {
    setFilters({
      propertyType: "",
      gender: "",
      bedrooms: "",
      pricerange: "",
    });
    setFilteredProperties(properties);
  };

  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(
    indexOfFirstProperty,
    indexOfLastProperty
  );

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  return (
    <>
      {/* <div className="loader" style={{ display: isLoading ? "flex" : "none" }}>
        <img src={miniLogo} alt="logo" />
      </div> */}
      <div className="all-properties">
        <div className="top">
          <div className="search-bar">
            <input
              type="text"
              value={location}
              onChange={handleSearch}
              placeholder="Search by location..."
            />
          </div>
        </div>
        <div className="content-container">
          <div className="filters">
            <div className="filter">
              <select
                name="propertyType"
                onChange={handleFilter}
                value={filters.propertyType}
              >
                <option value="">Property Type</option>
                <option value="apartment">Apartment</option>
                <option value="pg">PG</option>
                <option value="singleroom">Single Room</option>
              </select>
            </div>
            <div className="filter">
              <select
                name="gender"
                onChange={handleFilter}
                value={filters.gender}
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="any">Any</option>
              </select>
            </div>
            <div className="filter">
              <select
                name="bedrooms"
                onChange={handleFilter}
                value={filters.bedrooms}
              >
                <option value="">Bedrooms</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5+</option>
              </select>
            </div>
            <div className="filter">
              <select
                name="pricerange"
                onChange={handleFilter}
                value={filters.pricerange}
              >
                <option value="">Price Range</option>
                <option value="0-10000">0 - 10,000</option>
                <option value="10001-20000">10,001 - 20,000</option>
                <option value="20001-30000">20,001 - 30,000</option>
                <option value="30001-infinite">30,000+</option>
              </select>
            </div>
            <div className="clear-filters-btn btn">
              <Link onClick={clearFilters}>Remove filters</Link>
            </div>
          </div>
          <div className="content">
            {isLoading ? (
              <div className="content-loader-container">
                <p className="content-loader"></p>
              </div>
            ) : currentProperties.length > 0 ? (
              <>
                {currentProperties.map((card, index) => (
                  <PropertyCardAll key={index} card={card} />
                ))}
                <ReactPaginate
                  pageCount={Math.ceil(
                    filteredProperties.length / propertiesPerPage
                  )}
                  pageRangeDisplayed={5}
                  marginPagesDisplayed={2}
                  onPageChange={handlePageChange}
                  containerClassName="pagination"
                  activeClassName="active"
                />
              </>
            ) : (
              <div>No Properties Found</div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AllProperties;
