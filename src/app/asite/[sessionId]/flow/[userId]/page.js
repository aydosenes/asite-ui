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
        <TableCell>{row.flowId}</TableCell>
        <TableCell>{row.statusString}</TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => handleDownload(row.flowId)}
          >
            {row.statusString === "Finished" && <DownloadIcon color="info"/>}
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
    const newUrl = `/asite/${sessionId}/create-flow/${userId}`;
    router.push(newUrl);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom component="div">
        İmza Süreçleri Listesi
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Button
                  variant="text"
                  size="small"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                >
                  Yeni İmza Süreci
                </Button>
              </TableCell>
              <TableCell>Süreç ID</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Sil</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flowList.map((row) => (
              <Row key={row.flowId} row={row} onDelete={handleDelete} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
