import React, { useState } from "react";
import { data } from "./data";

function updateRowValues(rows) {
  return rows.map((row) => {
    if (row.children) {
      row.children = updateRowValues(row.children);
      row.value = row.children.reduce((acc, child) => acc + child.value, 0);
    }
    return row;
  });
}

function redistributeValues(parentId, newParentValue, rows) {
  const findAndUpdate = (rows) => {
    return rows.map((row) => {
      if (row.id === parentId) {
        const originalTotal = row.value;
        row.value = newParentValue;

        if (row.children) {
          row.children = row.children.map((child) => {
            const contributionPercentage = (child.value / originalTotal) * 100;
            child.value = (
              newParentValue *
              (contributionPercentage / 100)
            ).toFixed(2);
            return child;
          });
        }
      } else if (row.children) {
        row.children = findAndUpdate(row.children);
        row.value = row.children.reduce((acc, child) => acc + child.value, 0);
      }
      return row;
    });
  };
  return findAndUpdate(rows);
}

function TableRow({ row, onValueChange }) {
  const [inputValue, setInputValue] = useState("");
  const [variance, setVariance] = useState(0);

  const handleAllocationPercentage = () => {
    const percentage = parseFloat(inputValue);
    if (!isNaN(percentage)) {
      const newValue = row.value * (1 + percentage / 100);
      onValueChange(row.id, newValue);
      setVariance(((newValue - row.originalValue) / row.originalValue) * 100);
    }
  };

  const handleAllocationValue = () => {
    const newValue = parseFloat(inputValue);
    if (!isNaN(newValue)) {
      onValueChange(row.id, newValue);
      setVariance(((newValue - row.originalValue) / row.originalValue) * 100);
    }
  };

  return (
    <React.Fragment>
      <tr>
        <td>{row.label}</td>
        <td>{parseFloat(row.value).toFixed(2)}</td>
        <td>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </td>
        <td>
          <button onClick={handleAllocationPercentage}>Allocation %</button>
        </td>
        <td>
          <button onClick={handleAllocationValue}>Allocation Val</button>
        </td>
        <td>{variance !== 0 && <span>{variance}%</span>}</td>
      </tr>
      {row.children &&
        row.children.map((child) => (
          <TableRow key={child.id} row={child} onValueChange={onValueChange} />
        ))}
    </React.Fragment>
  );
}

function Table() {
  const [rows, setRows] = useState(data.rows);

  const updateRowValue = (id, newValue) => {
    const updatedRows = updateRowValues(rows);
    setRows(redistributeValues(id, newValue, updatedRows));
  };

  const calculateGrandTotal = () => {
    return rows.reduce((acc, row) => acc + row.value, 0).toFixed(2);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
            <th>Input</th>
            <th>Allocation %</th>
            <th>Allocation Val</th>
            <th>Variance %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <TableRow key={row.id} row={row} onValueChange={updateRowValue} />
          ))}
          <tr>
            <td>Grand Total</td>
            <td>{calculateGrandTotal()}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Table;
