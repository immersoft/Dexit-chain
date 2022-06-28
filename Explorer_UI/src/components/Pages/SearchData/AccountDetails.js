import React, { useState, useEffect, Suspense } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Card, Typography, Button, CircularProgress, } from "@mui/material";
import { Box } from "@mui/system";


const columns = [
    { id: "txnhash", label: "Txn Hash", minWidth: 50 },
    { id: "block", label: "Block", minWidth: 50 },
    { id: "from", label: "From", minWidth: 50 },
    { id: "to", label: "To", minWidth: 50 },
    { id: "value", label: "Value", minWidth: 50 },
    { id: "txnfee", label: "Txn Fee", minWidth: 50 }
];



const AccountDetails = () => {


    return (
        <>
            <TableContainer component={Paper} sx={{p:2}}>
                <Table sx={{ maxWidth: 850 }} aria-label="simple table">
                    <TableHead>
                        <TableRow
                            className="heading_table"
                            sx={{ background: "#F8FAFD" }}
                        >
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ top: 57, minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>
        </>
    );
};

export default AccountDetails;
