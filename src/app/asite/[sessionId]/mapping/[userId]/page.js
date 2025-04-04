"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  Container,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Paper,
  Grid2,
  Checkbox,
  FormControlLabel,
  TextField,
  Box,
} from "@mui/material";
import { use } from "react";
import * as XLSX from "xlsx";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Asite({ params }) {
  const unwrappedParams = use(params);
  const [workspaceList, setWorkspaceList] = useState([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [formGroupList, setFormGroupList] = useState([]);
  const [formGroup, setFormGroup] = useState("");
  const [formTypeList, setFormTypeList] = useState([]);
  const [appBuilderId, setAppBuilderId] = useState("");
  const [fileExcel, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fieldList, setFieldList] = useState(null);
  const [fieldListExcel, setFieldListExcel] = useState([]);
  const [selectedItemField, setSelectedItemField] = useState("");
  const [selectedItemExcel, setSelectedItemExcel] = useState("");
  const [mappedData, setMappedData] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 1 - workspace secilir ve form type groups getirilir.
  const handleWorkspace = async (e) => {
    let workspaceId = e.target.value;
    e.preventDefault();
    setWorkspaceId(workspaceId);
    const aSessionID = decodeURIComponent(unwrappedParams.sessionId);
    const response = await fetch(
      `${process.env.BASE_URL}/api/Asite/form-types`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aSessionID, workspaceId }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      setFormGroupList(data.formTypeGroups);
      console.log(data);
    } else {
      const data = await response.json();
      setError(data.message || "Login failed");
    }
  };

  // 2 - form type group secilir
  const handleFormGroup = async (e) => {
    let formGroup = e.target.value;
    e.preventDefault();
    setFormGroup(formGroup);
    setFormTypeList(formGroup.formTypes);
  };

  // 3 - group icerisinden form type secilir ve AppBuilderCode ile form template'e ait fields getirilir.
  const handleFormType = async (e) => {
    let appBuilderID = e.target.value;
    e.preventDefault();
    setAppBuilderId(appBuilderID);

    const aSessionID = decodeURIComponent(unwrappedParams.sessionId);
    const response = await fetch(
      `${process.env.BASE_URL}/api/Asite/form-template`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aSessionID,
          workspaceId,
          appBuilderCode: appBuilderID,
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      if (data.fieldList.length > 0) {
        setFieldList(data.fieldList);
      }
    } else {
      const data = await response.json();
      setError(data.message || "Login failed");
    }
  };

  const handleInputChange = (value) => {
    console.log(value);
    setSelectedItemField(value);
  };

  const handleDelete = (value, to) => {
    setMappedData((prevData) =>
      prevData.filter((item) => item.value !== value)
    );
    setFieldListExcel((prevData) => [...prevData, to]);
    setFieldList((prevData) => [...prevData, value]);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFile(file);
    let filename = file.name;
    const filetype = file.type;
    setFileType(filetype);
    const nameWithoutExtension = filename.replace(".xlsx", "");
    setFileName(nameWithoutExtension);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetNames = workbook.SheetNames;
      const firstSheetName = sheetNames[0];
      //setFileName(firstSheetName);
      const namedCell = workbook.Workbook.Names;
      setFieldListExcel(namedCell);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleMap = async (e) => {
    e.preventDefault();
    const updatedFields = fieldList.filter(
      (item) => item !== selectedItemField
    );
    setFieldList(updatedFields);
    const updatedItems = fieldListExcel.filter(
      (item) => item !== selectedItemExcel
    );
    setFieldListExcel(updatedItems);
    setSelectedItemField("");
    setSelectedItemExcel("");
    setMappedData((prev) => [
      ...prev,
      { value: selectedItemField, to: selectedItemExcel },
    ]);
  };

  useEffect(() => {
    if (workspaceList.length == 0) {
      const aSessionID = decodeURIComponent(unwrappedParams.sessionId);
      fetch(`${process.env.BASE_URL}/api/Asite/workspaces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aSessionID }),
      })
        .then((response) => response.json())
        .then((data) => {
          setWorkspaceList(data.workspaces);
          console.log(data);
        })
        .catch((error) => router.push("/"));
    }
  }, []);

  useEffect(() => {
    if (workspaceId) {
      const aSessionID = decodeURIComponent(unwrappedParams.sessionId);
      fetch(`${process.env.BASE_URL}/api/Asite/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aSessionID, workspaceId }),
      })
        .then((response) => response.json())
        .then((data) => {
          setFolders(data.folders);
          console.log(data);
        })
        .catch((error) => router.push("/"));
    }
  }, [workspaceId]);

  const handleSelect = (folderId, folderName) => {
    setSelectedFolder({ id: folderId, name: folderName });
  };

  const handleSaveMapping = async () => {
    setLoading(true);
    const aSessionID = decodeURIComponent(unwrappedParams.sessionId);
    const formData = new FormData();
    formData.append("ASessionID", aSessionID);
    formData.append("WorkspaceId", getStaticId(workspaceId));
    formData.append("FolderId", getStaticId(selectedFolder.id));
    formData.append("UserId", unwrappedParams.userId);
    formData.append("File", fileExcel);
    formData.append("FileName", fileName);
    formData.append("FileType", fileType);
    const convertedData = mappedData.map(item => ({
      ...item,
      to: item.to?.Ref ?? ""
    }));
    formData.append("MappingItems", JSON.stringify(convertedData));    
    formData.append("Revision", revision);
    formData.append("PurposeOfIssue", purpose);
    formData.append("Status", status);
    formData.append("RevisionNotes", revisionNotes);
    formData.append("PublishAsPrivate", publishAsPrivate);
    const response = await fetch(`${process.env.BASE_URL}/api/Asite/mapping`, {
      method: "POST",
      body: formData,
      mode: "no-cors"
    });
    const result = await response.json();
    router.push(
      `/asite/${decodeURIComponent(
        unwrappedParams.sessionId
      )}/generate/${result}/${unwrappedParams.userId}`
    );
  };

  const renderTree = (nodes) => {
    return nodes.map((folder) => (
      <TreeItem
        key={`form-folder-${folder.folderId}`}
        itemId={folder.folderId}
        label={folder.folderName}
        onClick={() => handleSelect(folder.folderId, folder.folderName)}
      >
        {folder.subFolders.length > 0 && renderTree(folder.subFolders)}
      </TreeItem>
    ));
  };

  function getStaticId(value) {
    return value.split("$$")[0];
  }

  const [revision, setRevision] = useState("");
  const [purpose, setPurpose] = useState("");
  const [status, setStatus] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [publishAsPrivate, setPublishAsPrivate] = useState(false);

  return (
    <Container maxWidth="md" sx={{ pb: 20 }}>
      <FormControl fullWidth variant="outlined" margin="normal">
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
          <TextField
            label="Doc. Ref."
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            disabled
          />
          <TextField
            label="Revision"
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            value={revision}
            onChange={(e) => {
              setRevision(e.target.value);
            }}
          />
          <TextField
            label="Doc. Title"
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            disabled
          />
          <TextField
            label="Purpose Of Issue"
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            value={purpose}
            onChange={(e) => {
              setPurpose(e.target.value);
            }}
          />
          <TextField
            label="Status"
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
            }}
          />
          <TextField
            label="Revision Notes"
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            value={revisionNotes}
            onChange={(e) => {
              setRevisionNotes(e.target.value);
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={publishAsPrivate}
                onChange={(e) => {
                  setPublishAsPrivate(e.target.checked);
                }}
              />
            }
            label="Private"
          />
        </Box>
      </FormControl>
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel id="select-label-1">Select A Workspace</InputLabel>
        <Select
          id="select-1"
          labelId="select-label-1"
          value={workspaceId}
          onChange={handleWorkspace}
          label="Select A Workspace"
        >
          {workspaceList.map((item, index) => (
            <MenuItem key={index} value={item.workspaceId}>
              {item.workspaceName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {workspaceId && (
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel id="select-label-2">Select A Form Group</InputLabel>
          <Select
            id="select-2"
            labelId="select-label-2"
            value={formGroup}
            onChange={handleFormGroup}
            label="Select A Form Group"
          >
            {formGroupList.map((item, index) => (
              <MenuItem key={index} value={item}>
                {item.formGroupName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {formGroup && (
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel id="select-label-3">Select A Form Type</InputLabel>
          <Select
            id="select-3"
            labelId="select-label-3"
            value={appBuilderId}
            onChange={handleFormType}
            label="Select A Form Type"
          >
            {formTypeList.map((item, index) => (
              <MenuItem key={index} value={item.appBuilderID}>
                {item.formName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {fieldList && (
        <FormControl fullWidth variant="outlined" margin="normal">
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileUpload}
            style={{ marginTop: "10px", marginBottom: "10px" }}
          />
        </FormControl>
      )}
      {fieldList && fieldListExcel.length > 0 && (
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <Grid2 container spacing={1}>
            <Grid2 item size={5.5}>
              <Paper
                elevation={3}
                sx={{
                  width: "100%",
                  maxHeight: "500px", // İstediğiniz yüksekliği ayarlayın
                  overflowY: "auto", // Y ekseninde kaydırma ekleyin
                }}
              >
                <List>
                  {[...fieldList].sort((a, b) => a.localeCompare(b)).map((field, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemButton
                        selected={selectedItemField === field}
                        onClick={() => handleInputChange(field)}
                      >
                        <ListItemText primary={field} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid2>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleMap}
              disabled={!selectedItemField || !selectedItemExcel}
            >
              MAP
            </Button>

            <Grid2 item size={5.4}>
              <Paper
                elevation={3}
                sx={{
                  width: "100%",
                  maxHeight: "500px", // İstediğiniz yüksekliği ayarlayın
                  overflowY: "auto", // Y ekseninde kaydırma ekleyin
                }}
              >
                <List>
                  {fieldListExcel.map((item, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemButton
                        selected={selectedItemExcel === item}
                        onClick={() => {
                          setSelectedItemExcel(item);
                          console.log(item);
                        }}
                      >
                        <ListItemText primary={item.Name} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid2>
          </Grid2>
        </div>
      )}
      {folders && mappedData.length > 0 && (
        <FormControl fullWidth variant="outlined" margin="normal">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => setOpen(true)}
          >
            {!selectedFolder
              ? `Select Upload Folder`
              : `Selected Folder: ${selectedFolder.name}`}
          </Button>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Hedef Dosyayı Seçiniz</DialogTitle>
            <DialogContent>
              {folders.length > 0 ? (
                <SimpleTreeView>{renderTree(folders)}</SimpleTreeView>
              ) : (
                "Yükleniyor . . ."
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => setOpen(false)}
                disabled={!selectedFolder}
                sx={{ float: "right", marginTop: 2 }}
              >
                Select
              </Button>
            </DialogContent>
          </Dialog>
        </FormControl>
      )}
      {mappedData && mappedData.length > 0 && (
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <Grid2 container spacing={1}>
            <Grid2 item size={12}>
              <Typography>Mapped Fields</Typography>
              <Paper
                elevation={3}
                sx={{
                  width: "100%",
                  maxHeight: "500px", // İstediğiniz yüksekliği ayarlayın
                  overflowY: "auto", // Y ekseninde kaydırma ekleyin
                }}
              >
                <List>
                  {mappedData.map((obj, index) => (
                    <ListItem key={index} disablePadding sx={{ width: "95%" }}>
                      <ListItemButton
                        selected={selectedItemField === obj.value}
                        onClick={() => handleInputChange(obj.value)}
                      >
                        <ListItemText
                          primary={`${obj.value} => ${obj.to.Name}`}
                        />
                      </ListItemButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(obj.value, obj.to)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid2>
          </Grid2>
        </div>
      )}
      <FormControl
        width="80%"
        variant="outlined"
        margin="normal"
        sx={{ float: "right" }}
      >
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={() => handleSaveMapping()}
          disabled={!selectedFolder || loading}
        >
          {`Save Mapping`}
        </Button>
      </FormControl>
    </Container>
  );
}
