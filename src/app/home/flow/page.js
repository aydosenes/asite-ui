"use client";

import { use, useState, useEffect } from "react";
import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableSortLabel from "@mui/material/TableSortLabel";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Auth from "@/app/components/Auth";

function descendingComparator(a, b, orderBy) {
  const valA = a[orderBy];
  const valB = b[orderBy];

  if (orderBy === "createdAt") {
    return new Date(valB) - new Date(valA);
  }

  if (typeof valA === "number" && typeof valB === "number") {
    return valB - valA;
  }

  return valB.toString().localeCompare(valA.toString());
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const cmp = comparator(a[0], b[0]);
    if (cmp !== 0) return cmp;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

function Row({ row, onDelete }) {
  const [open, setOpen] = useState(false);

  const handleDownload = async (flowId) => {
    const requestId = "";
    const loginSessionId = "00000000-0000-0000-0000-000000000000";
    const url = `${process.env.BASE_URL}/api/ESignature/download-signed-file?flowId=${flowId}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Dosya indirilemedi");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `signed-${flowId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("İndirme hatası:", error);
    }
  };

  function formattedDate(date) {
    const target = new Date(date);
    return target.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.subject}</TableCell>
        <TableCell>{row.flowId}</TableCell>
        <TableCell>{row.statusString}</TableCell>
        <TableCell>{formattedDate(row.createdAt)}</TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => handleDownload(row.flowId)}
          >
            {row.statusString === "Finished" && <DownloadIcon color="info" />}
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="delete"
            size="small"
            color="error"
            onClick={() => onDelete(row.flowId)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                İmzacılar
              </Typography>
              <Table size="small" aria-label="flow-items">
                <TableHead>
                  <TableRow>
                    <TableCell>Ad Soyad</TableCell>
                    <TableCell>E-Posta</TableCell>
                    <TableCell>Sıra</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Tip</TableCell>
                    <TableCell>İmzacı URL</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.flowItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.fullname}</TableCell>
                      <TableCell>{item.eMail}</TableCell>
                      <TableCell>{item.orderNo}</TableCell>
                      <TableCell>{item.statusString}</TableCell>
                      <TableCell>{item.flowItemTypeString}</TableCell>
                      <TableCell>
                        <Typography
                          component="a"
                          href={item.urlForSigner}
                          target="_blank"
                          sx={{
                            textDecoration: "underline",
                            color: "primary.main",
                            cursor: "pointer",
                          }}
                        >
                          Click Here
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function CollapsibleTable({ params }) {
  const unwrappedParams = use(params);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("subject");
  const [flowList, setFlowList] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split("/");
  const sessionId = segments[2];
  const userId = segments[4];

  useEffect(() => {
    if (flowList.length === 0) {
      const aSessionID = decodeURIComponent(unwrappedParams.sessionId);
      fetch(`${process.env.BASE_URL}/api/ESignature/get-flow-list`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          setFlowList(data);
        })
        .catch(() => {
          router.push("/");
        });
    }
  }, []);

  const handleDelete = (flowId) => {
    fetch(`${process.env.BASE_URL}/api/ESignature/cancel-flow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flowId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setFlowList((prev) => prev.filter((f) => f.flowId !== flowId));
      })
      .catch(() => {
        router.push("/");
      });
  };

  const handleAdd = () => {
    const newUrl = `/home/create-flow`;
    router.push(newUrl);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedFlowList = stableSort(flowList, getComparator(order, orderBy));

  return (
    <Auth>
      <TableContainer component={Paper}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box display="flex" alignItems="center">
            <img
              src="/penguen.jpeg"
              alt="Logo"
              height={40}
              style={{ marginRight: 8 }}
            />
          </Box>
          <Box flexGrow={1} display="flex" justifyContent="center">
            <Typography variant="h6" component="div">
              İmza Süreçleri Listesi
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Yeni İmza Süreci
            </Button>
          </Box>
        </Box>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell sortDirection={orderBy === "subject" ? order : false}>
                <TableSortLabel
                  active={orderBy === "subject"}
                  direction={orderBy === "subject" ? order : "asc"}
                  onClick={() => handleRequestSort("subject")}
                >
                  Konu
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "flowId" ? order : false}>
                <TableSortLabel
                  active={orderBy === "flowId"}
                  direction={orderBy === "flowId" ? order : "asc"}
                  onClick={() => handleRequestSort("flowId")}
                >
                  Süreç ID
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={orderBy === "statusString" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "statusString"}
                  direction={orderBy === "statusString" ? order : "asc"}
                  onClick={() => handleRequestSort("statusString")}
                >
                  Durum
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={orderBy === "createdAt" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "createdAt"}
                  direction={orderBy === "createdAt" ? order : "asc"}
                  onClick={() => handleRequestSort("createdAt")}
                >
                  Tarih
                </TableSortLabel>
              </TableCell>
              <TableCell>İndir</TableCell>
              <TableCell>Sil</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFlowList.map((row) => (
              <Row key={row.flowId} row={row} onDelete={handleDelete} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Auth>
  );
}
