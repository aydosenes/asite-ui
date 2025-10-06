"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Button,
  Container,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  TextField,
  Box,
} from "@mui/material";
import { use } from "react";

export default function Asite({ params }) {
  const unwrappedParams = use(params);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [formTemplateId, setFormTemplateId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [data, setData] = useState("");
  const [roles, setRoles] = useState("");
  const [subForms, setSubForms] = useState("");
  const [projectGroups, setProjectGroups] = useState("");
  const [token, setToken] = useState("");

  const [siteSetList, setSiteSetList] = useState("");
  const [revisionSetList, setRevisionSetList] = useState("");
  const [statusSetList, setStatusSetList] = useState("");

  const [selectedSiteSet, setSelectedSiteSet] = useState("");
  const [selectedRevisionSet, setSelectedRevisionSet] = useState("");
  const [selectedStatusSet, setSelectedStatusSet] = useState("");

  const [subFormRoles, setSubFormRoles] = useState({});
  const handleSubFormRoleChange = (index, role) => {
    setSubFormRoles((prev) => ({
      ...prev,
      [index]: {
        index: index + 1,
        name: subForms[index].name,
        role_id: role.id,
        controls: subForms[index].controls,
      },
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem("crane-token") || "";
      if (token) {
        setToken(token);        
      }
  }, []);

  const handleGetCraneFormData = async () => {
    try {
      setLoading(true);
      fetch(`${process.env.BASE_URL}/api/CraneToAsite/get-crane-form-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formTemplateId: formTemplateId,
          projectId: projectId,
          token: token
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setData(data);
          setToken(data.token);
          setSubForms(JSON.parse(data.subForms).data.sub_forms);
          setProjectGroups(JSON.parse(data.projectGroups));
          setRoles(JSON.parse(data.projectRoles).data);
          setSiteSetList(JSON.parse(data.projectSets["site_sets"]).data);
          setRevisionSetList(
            JSON.parse(data.projectSets["revision_sets"]).data
          );
          setStatusSetList(JSON.parse(data.projectSets["status_sets"]).data);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    } catch (err) {
      setLoading(false);
      console.error("Failed to get data:", err);
    }
  };

  const handleCopyFormTemplate = async () => {
    try {
      setLoading(true);
      const payload = {
        FormTemplateId: formTemplateId,
        ProjectId: projectId,
        SelectedProjectSets: {
          site_set_id: selectedSiteSet,
          revision_set_id: selectedRevisionSet,
          status_set_id: selectedStatusSet,
        },
        ProjectGroups: JSON.stringify(projectGroups),
        SelectedSubForms: JSON.stringify(subFormRoles),
        Token: token,
      };
      fetch(`${process.env.BASE_URL}/api/CraneToAsite/set-crane-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          setOpen(true);
          setIsSuccess(data.isSuccess);
          setMessage(data.message);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    } catch (err) {
      setLoading(false);
      console.error("Failed to get data:", err);
    }
  };

  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ pb: 20 }}>
      <FormControl fullWidth variant="outlined" margin="normal">
        <Typography variant="h6" sx={{ mb: 2 }}>
          Project Info
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
          <TextField
            label="Form Template ID"
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            value={formTemplateId}
            onChange={(e) => {
              setFormTemplateId(e.target.value);
            }}
          />
          <TextField
            label="Project ID"
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => handleGetCraneFormData()}
            disabled={!formTemplateId || !projectId || loading}
          >
            {`Search`}
          </Button>
        </Box>
        {data && (
          <Box display="flex" gap={0.5} flexWrap="wrap" sx={{ mt: 4 }}>
            <Typography variant="h6">Project Sets</Typography>

            {/* Site Set */}
            <FormControl fullWidth variant="standard" margin="normal">
              <InputLabel id="select-label-2">Site Set</InputLabel>
              <Select
                value={selectedSiteSet}
                onChange={(e) => {
                  console.log(e.target.value);
                  setSelectedSiteSet(e.target.value);
                }}
              >
                {siteSetList.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Revision Set */}
            <FormControl fullWidth variant="standard" margin="normal">
              <InputLabel>Revision Set</InputLabel>
              <Select
                value={selectedRevisionSet}
                onChange={(e) => setSelectedRevisionSet(e.target.value)}
              >
                {revisionSetList.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status Set */}
            <FormControl fullWidth variant="standard" margin="normal">
              <InputLabel>Status Set</InputLabel>
              <Select
                value={selectedStatusSet}
                onChange={(e) => setSelectedStatusSet(e.target.value)}
              >
                {statusSetList.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
        {subForms && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              SubForms & Roles
            </Typography>

            <Box display="flex" gap={0.5} flexWrap="wrap">
              {subForms.map((sf, index) => (
                <Box
                  key={sf.index}
                  sx={{
                    border: "1px solid #ddd",
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    width: "100%",
                  }}
                >
                  <Typography variant="subtitle1">{sf.name}</Typography>
                  <FormControl fullWidth variant="standard" margin="normal">
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={subFormRoles[index]?.role_id || ""}
                      onChange={(e) => {
                        const selectedRole = roles.find(
                          (r) => r.id === e.target.value
                        );
                        handleSubFormRoleChange(index, selectedRole);
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200, // dropdown yüksekliği
                            overflowY: "auto", // sadece dropdown scroll
                          },
                        },
                      }}
                    >
                      {roles.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ))}
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => handleCopyFormTemplate()}
              disabled={loading}
            >
              {`Copy Form Template`}
            </Button>

            <Snackbar
              open={open}
              autoHideDuration={5000} // 3 saniye sonra otomatik kapanacak
              onClose={handleClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Alert
                onClose={handleClose}
                severity= {isSuccess ? "success" : "error"}
                sx={{ width: "100%" }}
              >
                {message}
              </Alert>
            </Snackbar>
          </Box>
        )}
      </FormControl>
    </Container>
  );
}
