"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Button,
  Container,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import PropTypes from "prop-types";
import { use } from "react";

export default function Asite({ params }) {
  const unwrappedParams = use(params);
  const [loading, setLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [sourceProject, setSourceProject] = useState("");
  const [targetProject, setTargetProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [siteSets, setSiteSets] = useState([]);
  const [token, setToken] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [importCompleted, setImportCompleted] = useState(false);
  const urls = [
    "revision-sets",
    "roles",
    "status-sets",
    "metadata-sets",
    "companies",
    "company-groups",
    "company-users",
    "form-templates",
  ];
  useEffect(() => {
    if (projects.length == 0) {
      const token = localStorage.getItem("crane-token") || "";
      if (token) {
        setToken(token);
        fetch(`${process.env.BASE_URL}/api/Cloner/get-projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
          .then((response) => response.json())
          .then((data) => {
            setProjects(data);
          })
          .catch((error) => router.push("/"));
      }
    }
  }, []);

  const handleSetSourceProject = async (e) => {
    setSourceProject(e.target.value);
    setTargetProject("");
    handleGetSiteSets(e.target.value);
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      fetch(`${process.env.BASE_URL}/api/Cloner/create-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          token: token,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setTargetProject(data.data);
          setImportCompleted(false);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    } catch (err) {
      setLoading(false);
      console.error("Failed to get data:", err);
    }
  };

  const handleGetSiteSets = async (id) => {
    try {
      setLoading(true);
      fetch(`${process.env.BASE_URL}/api/Cloner/get-site-sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          token: token,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setSiteSets(data);
          setImportCompleted(false);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    } catch (err) {
      setLoading(false);
      console.error("Failed to get data:", err);
    }
  };

  const handleExcelUpload = (index, file) => {
    const newSiteSets = [...siteSets];
    newSiteSets[index].excelFile = file;
    setSiteSets(newSiteSets);
  };

  const handleRemoveExcel = (index) => {
    setSiteSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, excelFile: null } : s))
    );
  };

  const handleImportSiteSets = async () => {
    try {
      setLoading(true);
      for (const siteSet of siteSets) {
        if (siteSet.excelFile) {
          const formData = new FormData();
          formData.append("ProjectId", targetProject.id);
          formData.append("SiteSetName", siteSet.name);
          formData.append("Token", token);
          formData.append("File", siteSet.excelFile);
          const response = await fetch(
            `${process.env.BASE_URL}/api/Cloner/site-sets`,
            {
              method: "POST",
              body: formData,
            }
          );
          const result = await response.json();
          setImportCompleted(true);
        }
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to import siteSets:", err);
    }
  };

  const handleClone = async () => {
    setLoading(true);
    for (const url of urls) {
      try {
        const response = await fetch(
          `${process.env.BASE_URL}/api/Cloner/${url}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sourceProjectId: sourceProject,
              targetProjectId: targetProject.id,
              token: token,
            }),
          }
        );

        const data = await response.json();
        console.log(`Response from ${url}:`, data);
      } catch (error) {
        console.error(`Error in request ${url}:`, error);
      }
    }
    setIsSuccess(true);
    setMessage("Klonlama başarıyla tamamlandı!");
    setOpen(true);
    setAllLoading(false);
    setLoading(false);
  };

  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const messages = [
    "Revision setting...",
    "Roles setting...",
    "Status setting...",
    "Metadata setting...",
    "Companies setting...",
    "Company Groups setting...",
    "Company Users setting...",
    "Form Templates setting...",
  ];
  const [progress, setProgress] = useState(messages[0]);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % messages.length;
      setProgress(messages[index]);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function CircularProgressWithLabel(props) {
    return (
      <Box sx={{ position: "relative", display: "flex" }}>
        {/* <CircularProgress variant="determinate" {...props} /> */}
        <CircularProgress size="30px" />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="caption"
            component="div"
            sx={{ color: "text.secondary" }}
          >
            {`${props.value}`}
          </Typography>
        </Box>
      </Box>
    );
  }

  CircularProgressWithLabel.propTypes = {
    /**
     * The value of the progress indicator for the determinate variant.
     * Value between 0 and 100.
     * @default 0
     */
    value: PropTypes.number.isRequired,
  };

  return (
    <Container maxWidth="md" sx={{ pb: 20 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Project Cloner
      </Typography>
      <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
        <FormControl margin="normal" sx={{ flex: 1 }}>
          <TextField
            select
            label="Source Project"
            value={sourceProject}
            onChange={handleSetSourceProject}
            size="small"
            sx={{ flex: 1 }}
          >
            {projects.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Project Name"
            variant="outlined"
            size="small"
            sx={{ flex: 1, mt: 2 }} // margin alignment için mt ekleyebilirsin
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => handleCreate()}
            disabled={!projectName || loading}
            sx={{ mt: "16px" }}
          >
            {loading ? (
              <CircularProgress size="30px" color="inherit" />
            ) : (
              "Create"
            )}
          </Button>
        </FormControl>
      </Box>
      {sourceProject && targetProject && siteSets.length > 0 && (
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
          <FormControl margin="normal" sx={{ flex: 1 }}>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">Site Set Name</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">File Name</Typography>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {siteSets.map((siteSet, index) => (
                    <TableRow key={siteSet.id || index}>
                      <TableCell align="left">
                        <Typography
                          sx={{ opacity: siteSet.excelFile ? 1 : 0.3 }}
                        >
                          {siteSet.name}
                        </Typography>
                      </TableCell>

                      <TableCell
                        sx={{
                          maxWidth: 50, // sabit max genişlik
                          whiteSpace: "nowrap", // tek satır
                          overflow: "hidden", // taşanı gizle
                          textOverflow: "ellipsis", // ... ile kısalt
                        }}
                      >
                        {siteSet.excelFile ? siteSet.excelFile.name : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {siteSet.excelFile ? (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleRemoveExcel(index)}
                            disabled={loading}
                          >
                            {loading ? (
                              <CircularProgress size="20px" color="inherit" />
                            ) : (
                              "Remove"
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            component="label"
                            size="small"
                            disabled={loading}
                          >
                            {loading ? (
                              <CircularProgress size="20px" color="inherit" />
                            ) : (
                              <>
                                Upload
                                <input
                                  type="file"
                                  accept=".xlsx, .xls"
                                  hidden
                                  onChange={(e) =>
                                    handleExcelUpload(index, e.target.files[0])
                                  }
                                />
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => handleImportSiteSets()}
              disabled={
                !siteSets.some((siteSet) => siteSet.excelFile !== undefined) ||
                loading
              }
              sx={{ mt: "16px" }}
            >
              {loading ? (
                <CircularProgress size="30px" color="inherit" />
              ) : (
                "Import"
              )}
            </Button>
          </FormControl>
        </Box>
      )}
      {importCompleted && siteSets.length > 0 && (
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
          <FormControl margin="normal" sx={{ flex: 1 }}>
            {loading ? (
              <CircularProgressWithLabel value={progress} />
            ) : (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => handleClone()}
                sx={{ mt: "16px" }}
                disabled={
                  !siteSets.some((siteSet) => siteSet.excelFile !== undefined)
                }
              >
                Clone All Sets
              </Button>
            )}
          </FormControl>
          <Snackbar
            open={open}
            autoHideDuration={5000} // 3 saniye sonra otomatik kapanacak
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={handleClose}
              severity={isSuccess ? "success" : "error"}
              sx={{ width: "100%" }}
            >
              {message}
            </Alert>
          </Snackbar>
        </Box>
      )}
    </Container>
  );
}
