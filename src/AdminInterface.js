import "./styles.css";
import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Button
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";

export default function AdminInterface() {
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [selectAllRows, setSelectAllRows] = useState(false);

  useEffect(() => {
    // Fetch user data from the API
    fetch(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
        calculateTotalPages(data);
        setCurrentPage(1);
      })
      .catch((error) => console.error(error));
  }, []);

  // Calculate total pages based on filtered data
  const calculateTotalPages = useCallback(
    (data) => {
      const filteredData = data.filter(
        (user) =>
          user.id.toString().includes(searchQuery) ||
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const pages = Math.ceil(filteredData.length / 10);
      setTotalPages(pages);
      setCurrentPage((prevPage) => Math.min(prevPage, pages));
    },
    [searchQuery]
  );
  useEffect(() => {
    // Recalculate total pages when search query or user data changes
    calculateTotalPages(userData);
  }, [searchQuery, userData, calculateTotalPages]);

  // Get the data for the current page
  const getCurrentPageData = () => {
    const filteredData = userData.filter(
      (user) =>
        user.id.toString().includes(searchQuery) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;

    return filteredData.slice(startIndex, endIndex);
  };

  // Handler for search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page when search query changes
  };

  // Handler for page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler for row selection
  const handleRowSelect = (rowId) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  // Handler for selecting or deselecting all rows on the current page
  const handleSelectAllRows = () => {
    const currentPageData = getCurrentPageData();
    const currentPageIds = currentPageData.map((user) => user.id);
    if (selectedRows.length === currentPageIds.length) {
      setSelectedRows([]);
      setSelectAllRows(false);
    } else {
      setSelectedRows(currentPageIds);
      setSelectAllRows(true);
    }
  };

  // Handler for editing a row
  const handleEditRow = (rowId) => {
    setEditingRow(rowId);
  };

  // Handler for saving the edited row
  const handleSaveRow = (rowId) => {
    // Implement the logic to save the edited row
    setEditingRow(null);
  };

  // Handler for deleting a row
  const handleDeleteRow = (rowId) => {
    // Implement the logic to delete the row with the given ID from the userData state
    setUserData((prevData) => prevData.filter((user) => user.id !== rowId));
  };

  // Handler for deleting selected rows
  const handleDeleteSelected = () => {
    // Implement the logic to delete the selected rows from the userData state
    setUserData((prevData) =>
      prevData.filter((user) => !selectedRows.includes(user.id))
    );
    setSelectedRows([]);
  };

  // Render table rows
  const renderTableRows = () => {
    const currentPageData = getCurrentPageData();

    return currentPageData.map((user) => (
      <TableRow key={user.id} selected={selectedRows.includes(user.id)}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selectedRows.includes(user.id)}
            onChange={() => handleRowSelect(user.id)}
          />
        </TableCell>
        <TableCell>{user.id}</TableCell>
        <TableCell>
          {editingRow === user.id ? (
            <TextField
              value={user.name}
              onChange={(e) =>
                setUserData((prevData) =>
                  prevData.map((prevUser) =>
                    prevUser.id === user.id
                      ? { ...prevUser, name: e.target.value }
                      : prevUser
                  )
                )
              }
            />
          ) : (
            user.name
          )}
        </TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.role}</TableCell>
        <TableCell>
          {editingRow === user.id ? (
            <Button
              variant="text"
              className="Icon-color"
              onClick={() => handleSaveRow(user.id)}
            >
              Save
            </Button>
          ) : (
            <Button
              variant="text"
              className="Icon-color"
              onClick={() => handleEditRow(user.id)}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          )}
          <Button
            variant="text"
            className="Icon-color1"
            onClick={() => handleDeleteRow(user.id)}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  // Render pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];

    buttons.push(
      <Button
        key="first"
        variant="outlined"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className="PaginationButton"
      >
        {"<<"}
      </Button>
    );

    buttons.push(
      <Button
        key="prev"
        variant="outlined"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="PaginationButton"
      >
        {"<"}
      </Button>
    );

    for (let page = 1; page <= totalPages; page++) {
      buttons.push(
        <Button
          key={page}
          variant="outlined"
          onClick={() => handlePageChange(page)}
          disabled={currentPage === page}
          className={`PaginationButton ${
            currentPage === page ? "ActivePage" : ""
          }`}
        >
          {page}
        </Button>
      );
    }

    buttons.push(
      <Button
        key="next"
        variant="outlined"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="PaginationButton"
      >
        {">"}
      </Button>
    );

    buttons.push(
      <Button
        key="last"
        variant="outlined"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="PaginationButton"
      >
        {">>"}
      </Button>
    );

    return buttons;
  };

  return (
    <div>
      <div className="container">
        <h1>Admin Interface</h1>
        <TextField
          label="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by name, email or role...."
          style={{ width: "100%" }}
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectAllRows}
                  onChange={handleSelectAllRows}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderTableRows()}</TableBody>
        </Table>
      </div>
      <div>
        <Button
          variant="contained"
          className="DeleteSelectedButton"
          onClick={handleDeleteSelected}
        >
          Delete Selected
        </Button>
      </div>
      <div className="pagination">
        <div className="pagination-buttons">{renderPaginationButtons()}</div>
      </div>
    </div>
  );
}
