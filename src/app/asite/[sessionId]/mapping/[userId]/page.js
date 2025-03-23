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
} from "@mui/material";
import { use } from "react";
import * as XLSX from "xlsx";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function Asite({ params }) {
  const unwrappedParams = use(params);
  const [workspaceList, setWorkspaceList] = useState([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [formGroupList, setFormGroupList] = useState([]);
  const [formGroup, setFormGroup] = useState("");
  const [formTypeList, setFormTypeList] = useState([]);
  const [formTypeId, setFormTypeId] = useState("");
  const [formList, setFormList] = useState([]);
  const [formId, setFormId] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [fileExcel, setFile] = useState(null);
  const [insertAttachments, setInsertAttachments] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fieldList, setFieldDic] = useState(null);
  const [fieldListExcel, setFieldListExcel] = useState([]);
  const [selectedItemKey, setSelectedItemKey] = useState("");
  const [selectedItemValue, setSelectedItemValue] = useState("");
  const [selectedItemExcel, setSelectedItemExcel] = useState("");

  const [mappedData, setMappedData] = useState([]);

  const [folders, setFolders] = useState([]);
  const [selectedAttachmentFolder, setSelectedAttachmentFolder] =
    useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [open, setOpen] = useState(false);
  const [openForAtt, setOpenForAtt] = useState(false);

  const [createdMappingId, setCreatedMappingId] = useState("");
  const [existingMapping, setExistingMapping] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleFormGroup = async (e) => {
    let formGroup = e.target.value;
    e.preventDefault();
    setFormGroup(formGroup);
    setFormTypeList(formGroup.formTypes);
  };

  const handleFormType = async (e) => {
    let formTypeId = e.target.value;
    e.preventDefault();
    setFormTypeId(formTypeId);

    const aSessionID = decodeURIComponent(unwrappedParams.sessionId);
    const response = await fetch(
      `${process.env.BASE_URL}/api/Asite/form-summary`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aSessionID, workspaceId, formTypeId }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      if (data.firstPage) {
        setFormList(data.firstPage);
      }
    } else {
      const data = await response.json();
      setError(data.message || "Login failed");
    }
  };

  const handleForm = async (e) => {
    let formId = e.target.value;
    e.preventDefault();
    setFormId(formId);

    const aSessionID = decodeURIComponent(unwrappedParams.sessionId);
    const response = await fetch(
      `${process.env.BASE_URL}/api/Asite/form-details`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aSessionID, workspaceId, formId }),
      }
    );
    const details = await response.json();
    console.log(details);
    setFieldDic(details.fieldList);
  };

  const handleInputChange = (key, value) => {
    setSelectedItemKey(key);
    setSelectedItemValue(value);
    console.log(value);
  };

  const handleDelete = (key, value, to) => {
    setMappedData((prevData) => prevData.filter((item) => item.key !== key));
    setFieldListExcel((prevData) => [...prevData, to]);
    const updatedFieldDic = { ...fieldList };
    updatedFieldDic[key] = value;
    setFieldDic(updatedFieldDic);
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
    const updatedFieldDic = { ...fieldList };
    delete updatedFieldDic[selectedItemKey];
    setFieldDic(updatedFieldDic);
    const updatedItems = fieldListExcel.filter(
      (item) => item !== selectedItemExcel
    );
    setFieldListExcel(updatedItems);
    setSelectedItemKey("");
    setSelectedItemValue("");
    setSelectedItemExcel("");

    setMappedData((prev) => [
      ...prev,
      { key: selectedItemKey, value: selectedItemValue, to: selectedItemExcel },
    ]);
  };

  const handleInsertAttachments = async (mappingId) => {
    const aSessionID = decodeURIComponent(unwrappedParams.sessionId);
    fetch(`https://localhost:44305/api/Asite/upload-form-attachment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aSessionID,
        workspaceId: workspaceId,
        folderId: getStaticId(selectedAttachmentFolder.id),
        mappingId: mappingId,
        attachments,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          console.log(data);
        }
      })
      .catch((error) => console.log(error));
  };

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

  useEffect(() => {
    console.log("xxxxxxxx");
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
    if (formId) {
      const aSessionID = decodeURIComponent(unwrappedParams.sessionId);
      fetch(`${process.env.BASE_URL}/api/Asite/form-attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aSessionID, workspaceId, formId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            setAttachments(data.attachments);
            console.log(data);
          }
        })
        .catch((error) => console.log(error));
    }
  }, [formId]);

  const handleSelect = (folderId, folderName) => {
    setSelectedFolder({ id: folderId, name: folderName });
  };
  const handleSelectAttachements = (folderId, folderName) => {
    setSelectedAttachmentFolder({ id: folderId, name: folderName });
  };

  const handleSaveMapping = async () => {
    setLoading(true);
    const aSessionID = decodeURIComponent(unwrappedParams.sessionId);
    const formData = new FormData();
    formData.append("ASessionID", aSessionID);
    formData.append("WorkspaceId", getStaticId(workspaceId));
    formData.append("FormId", getStaticId(formId));
    formData.append("FolderId", getStaticId(selectedFolder.id));
    formData.append("UserId", unwrappedParams.userId);
    formData.append("File", fileExcel);
    formData.append("FileName", fileName);
    formData.append("FileType", fileType);
    formData.append("MappingItems", JSON.stringify(mappedData));
    const response = await fetch(`${process.env.BASE_URL}/api/Asite/mapping`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    setCreatedMappingId(result);
    if (insertAttachments) {
      handleInsertAttachments(result);
    }
    router.push(
      `/asite/${decodeURIComponent(unwrappedParams.sessionId)}/generate/${result}/${unwrappedParams.userId}`
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

  const renderTreeAttachments = (nodes) => {
    return nodes.map((folder) => (
      <TreeItem
        key={`attachment-folder-${folder.folderId}`}
        itemId={folder.folderId}
        label={folder.folderName}
        onClick={() =>
          handleSelectAttachements(folder.folderId, folder.folderName)
        }
      >
        {folder.subFolders.length > 0 &&
          renderTreeAttachments(folder.subFolders)}
      </TreeItem>
    ));
  };

  function getStaticId(value) {
    return value.split("$$")[0];
  }

  return (
    <Container maxWidth="md">
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
            value={formTypeId}
            onChange={handleFormType}
            label="Select A Form Type"
          >
            {formTypeList.map((item, index) => (
              <MenuItem key={index} value={item.formTypeID}>
                {item.formName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {formTypeId && (
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel id="select-label-3">Select A Form</InputLabel>
          <Select
            id="select-3"
            labelId="select-label-3"
            value={formId}
            onChange={handleForm}
            label="Select A Form"
          >
            {formList.map((item, index) => (
              <MenuItem key={index} value={item.formId}>
                {item.formVO.formCode} - {item.formVO.formName}
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
      {fileExcel && (
        <FormControl fullWidth variant="outlined" margin="normal">
          <FormControlLabel
            control={
              <Checkbox
                checked={insertAttachments}
                onChange={() => setInsertAttachments(!insertAttachments)}
              />
            }
            label="Insert Attachments"
          />
        </FormControl>
      )}
      {folders && insertAttachments && (
        <FormControl fullWidth variant="outlined" margin="normal">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => setOpenForAtt(true)}
          >
            {!selectedAttachmentFolder
              ? `Select Attachment Upload Folder`
              : `Selected Folder: ${selectedAttachmentFolder.name}`}
          </Button>
          <Dialog
            open={openForAtt}
            onClose={() => setOpenForAtt(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Select a Folder</DialogTitle>
            <DialogContent>
              <SimpleTreeView>{renderTreeAttachments(folders)}</SimpleTreeView>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => setOpenForAtt(false)}
                disabled={!selectedAttachmentFolder}
                sx={{ float: "right", marginTop: 2 }}
              >
                Select
              </Button>
            </DialogContent>
          </Dialog>
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
                  {Object.entries(fieldList).map(([key, value]) => (
                    <ListItem key={key} disablePadding>
                      <ListItemButton
                        selected={selectedItemKey === key}
                        onClick={() => handleInputChange(key, value)}
                      >
                        <ListItemText primary={key} />
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
              disabled={!selectedItemKey || !selectedItemExcel}
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
            <DialogTitle>Select a Folder</DialogTitle>
            <DialogContent>
              <SimpleTreeView>{renderTree(folders)}</SimpleTreeView>
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
                  {mappedData.map((obj) => (
                    <ListItem
                      key={obj.key}
                      disablePadding
                      sx={{ width: "95%" }}
                    >
                      <ListItemButton
                        selected={selectedItemKey === obj.key}
                        onClick={() => handleInputChange(obj.key, obj.value)}
                      >
                        <ListItemText
                          primary={`${obj.key} (${obj.value}) => ${obj.to.Name}`}
                        />
                      </ListItemButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(obj.key, obj.value, obj.to)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid2>
            <Grid2 item size={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => handleSaveMapping()}
                disabled={!selectedFolder || loading}
              >
                {`Save Mapping`}
              </Button>
            </Grid2>
          </Grid2>
        </div>
      )}
    </Container>
  );
}
