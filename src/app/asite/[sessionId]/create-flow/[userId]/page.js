"use client";

import { use, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FormControl,
  InputLabel,
  Container,
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Grid2,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import dynamic from "next/dynamic";
const PdfCanvasViewer = dynamic(
  () => import("@/app/components/PdfCanvasViewer"),
  {
    ssr: false,
  }
);

const defaultFlowItem = {
  fullname: "",
  eMail: "",
  citizenshipNo: "",
  orderNo: 1,
  groupNo: 1,
  flowItemId: undefined,
  flowItemType: 0,
  flowItemGroupAuthorityType: 0,
  byPassOtpForExternalUser: true,
  page: null,
  position: null,
};

const ITEM_TYPE = "FLOW_ITEM";

const signatureTypes = [
  { label: "PAdES", value: 0 },
  { label: "CAdES", value: 1 },
  { label: "e-Yazışma", value: 2 },
  { label: "CAdES Naturel", value: 3 },
  { label: "XAdES", value: 4 },
];

const qrCodeModes = [
  { label: "Kullanma", value: 1 },
  { label: "Kullan", value: 2 },
];

const confirmationModes = [
  { label: "Doğruluk teyit (indirme yok)", value: 1 },
  { label: "Doğruluk teyit + indirme", value: 2 },
  { label: "İmzalıdır ibaresi basılmaz", value: 3 },
];

const flowTypes = [
  { label: "Temel", value: 1 },
  { label: "Gelişmiş", value: 2 },
];

const flowItemTypes = [
  { label: "İmza", value: 0 },
  { label: "Onay", value: 1 },
  { label: "İzleme", value: 2 },
];

const flowItemGroupAuthorities = [
  { label: "Normal", value: 0 },
  { label: "Tam Yetkili", value: 1 },
  { label: "Kısmi Yetkili", value: 2 },
];

function convertQrCodePosition({ x, y }, canvasWidth, canvasHeight) {
  const result = {
    qrCodeLeft: "",
    qrCodeRight: "",
    qrCodeTop: "",
    qrCodeBottom: "",
    qrCodeTransformOrigin: "",
  };
  // X: left veya right (tercihen right)
  if (x < canvasWidth / 2) {
    const leftPercent = Math.round((x / canvasWidth) * 100) + "%";
    result.qrCodeLeft = leftPercent;
    result.qrCodeTransformOrigin = "left top";
  } else {
    const right = canvasWidth - x;
    const rightPercent = Math.round((right / canvasWidth) * 100) + "%";
    result.qrCodeRight = rightPercent;
    result.qrCodeTransformOrigin = "right top";
  }

  // Y: top veya bottom (tercihen top)
  if (y < canvasHeight / 2) {
    const topPercent = Math.round((y / canvasHeight) * 100) + "%";
    result.qrCodeTop = topPercent;
  } else {
    const bottom = canvasHeight - y;
    const bottomPercent = Math.round((bottom / canvasHeight) * 100) + "%";
    result.qrCodeBottom = bottomPercent;
  }
  return result;
}

export default function CreateFlowForm({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split("/");
  const sessionId = segments[2];
  const userId = segments[4];
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    loginSessionId: "",
    subject: "",
    signatureType: 0,
    qrCodeMode: 1,
    confirmationMode: 2,
    requestId: "",
    displayLanguage: "tr",
    flowType: 1,
    flowItems: [structuredClone(defaultFlowItem)],
    pdfFile: null,
    qrCodePositions: {},
    notes: "",
  });
  const fileInputRef = useRef(null);

  const handleFileRemove = () => {
    setForm((prev) => ({ ...prev, pdfFile: null }));

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setForm({ ...form, pdfFile: file });
    } else {
      alert("Lütfen PDF dosyası seçiniz.");
      setForm({ ...form, pdfFile: null });
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFlowItemChange = (index, key, value) => {
    const updatedItems = [...form.flowItems];
    updatedItems[index][key] = value;
    setForm({ ...form, flowItems: updatedItems });
  };

  const addFlowItem = () => {
    setForm({
      ...form,
      flowItems: [...form.flowItems, structuredClone(defaultFlowItem)],
    });
  };

  const removeFlowItem = (index) => {
    const updatedItems = form.flowItems.filter((_, i) => i !== index);
    setForm({ ...form, flowItems: updatedItems });
  };

  const handleSubmit = () => {
    setLoading(true);
    fetch(`${process.env.BASE_URL}/api/ESignature/create-flow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loginSessionId: "00000000-0000-0000-0000-000000000000",
        subject: form.subject,
        signatureType: form.signatureType,
        qrCodeMode: form.qrCodeMode,
        confirmationMode: form.confirmationMode,
        requestId: "a9X7aLm4QpZ2vTjRwCk38",
        displayLanguage: "tr",
        flowType: form.flowType,
        flowItems: form.flowItems,
      }),
    })
      .then((res) => res.json())
      .then((data1) => {
        let currentFlowItems = [];
        setForm((prev) => {
          const updatedItems = prev.flowItems.map((item) => {
            const match = data1.flowItems.find((f) => f.email === item.eMail);
            return match ? { ...item, flowItemId: match.flowItemId } : item;
          });
          currentFlowItems = updatedItems;
          return {
            ...prev,
            flowItems: updatedItems,
          };
        });
        const formData = new FormData();
        formData.append("File", form.pdfFile);
        formData.append("FlowId", data1.flowId);
        fetch(`${process.env.BASE_URL}/api/ESignature/add-file-to-flow`, {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data2) => {
            fetch(`${process.env.BASE_URL}/api/ESignature/set-fields`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                loginSessionId: "00000000-0000-0000-0000-000000000000",
                flowId: data1.flowId,
                requestId: "a9X7aLm4QpZ2vTjRwCk38",
                displayLanguage: "tr",
                signatures: currentFlowItems.map((item) => ({
                  x: Math.round(item.position.x / 2),
                  y: Math.round(item.position.y / 2.8),
                  pageId: data2.pages.find((f) => f.pageNo === item.page).id,
                  flowItemId: item.flowItemId,
                })),
                ...form.qrCodePositions.values,
              }),
            })
              .then((res) => res.json())
              .then((data3) => {
                fetch(`${process.env.BASE_URL}/api/ESignature/start-flow`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    loginSessionId: "00000000-0000-0000-0000-000000000000",
                    requestId: "a9X7aLm4QpZ2vTjRwCk38",
                    displayLanguage: "tr",
                    flowId: data1.flowId,
                    flowSubject: form.subject,
                    note: form.notes,
                  }),
                })
                  .then((res) => res.json())
                  .then((data4) => {
                    setLoading(false);
                    if (data4?.result?.isOk) {
                      const newUrl = `/asite/${sessionId}/flow/${userId}`;
                      router.push(newUrl);
                    }
                  })
                  .catch(() => {
                    setLoading(false);
                    const newUrl = `/asite/${sessionId}/flow/${userId}`;
                    router.push(newUrl);
                  });
              })
              .catch(() => {
                setLoading(false);
                const newUrl = `/asite/${sessionId}/flow/${userId}`;
                router.push(newUrl);
              });
          })
          .catch(() => {
            setLoading(false);
            const newUrl = `/asite/${sessionId}/flow/${userId}`;
            router.push(newUrl);
          });
      })
      .catch(() => {
        setLoading(false);
        const newUrl = `/asite/${sessionId}/flow/${userId}`;
        router.push(newUrl);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const FlowItemTag = ({ item, index }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ITEM_TYPE,
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <Chip
        label={item.fullname || `İmzacı ${index + 1}`}
        color="primary"
        variant="outlined"
        ref={drag}
        sx={{
          opacity: isDragging ? 0.5 : 1,
          cursor: "move",
          userSelect: "none",
          marginRight: 1,
          marginBottom: 1,
        }}
      />
    );
  };

  const QrCodeTag = () => {
    const [{ isDragging }, drag] = useDrag({
      type: "QR_CODE",
      item: { type: "QR_CODE" },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <Box
        ref={drag}
        component="img"
        src="https://upload.wikimedia.org/wikipedia/commons/4/41/QR_Code_Example.svg" // public klasörüne koy
        alt="QR Kod"
        width={60}
        height={60}
        sx={{
          opacity: isDragging ? 0.5 : 1,
          cursor: "move",
          userSelect: "none",
          marginRight: 1,
          marginBottom: 1,
        }}
      />
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Container maxWidth="lg" sx={{ pb: 20 }}>
        <Paper sx={{ p: 2, overflowX: "auto" }} elevation={4}>
          <Typography variant="h6" gutterBottom>
            Yeni İmza Süreci
          </Typography>
          <Grid2 container spacing={1} wrap="nowrap">
            <Grid2 size={3}>
              <TextField
                fullWidth
                label="Konu"
                name="subject"
                value={form.subject}
                onChange={handleInputChange}
              />
            </Grid2>
            <Grid2 size={2}>
              <FormControl fullWidth>
                <InputLabel id="signatureType-label">İmza Tipi</InputLabel>
                <Select
                  labelId="signatureType-label"
                  name="signatureType"
                  value={form.signatureType}
                  label="İmza Tipi"
                  onChange={handleInputChange}
                >
                  {signatureTypes.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={2}>
              <FormControl fullWidth>
                <InputLabel id="qrCodeMode-label">QR Kodu</InputLabel>
                <Select
                  labelId="qrCodeMode-label"
                  name="qrCodeMode"
                  value={form.qrCodeMode}
                  label="QR Kodu"
                  onChange={handleInputChange}
                >
                  {qrCodeModes.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={3}>
              <FormControl fullWidth>
                <InputLabel id="confirmationMode-label">Onaylama</InputLabel>
                <Select
                  labelId="confirmationMode-label"
                  name="confirmationMode"
                  value={form.confirmationMode}
                  label="Onaylama"
                  onChange={handleInputChange}
                >
                  {confirmationModes.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={2}>
              <FormControl fullWidth>
                <InputLabel id="flowType-label">Süreç Tipi</InputLabel>
                <Select
                  labelId="flowType-label"
                  name="flowType"
                  value={form.flowType}
                  label="Süreç Tipi"
                  onChange={handleInputChange}
                >
                  {flowTypes.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>

          <Box mt={3} mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              İmzalanacak Dosya
            </Typography>
            <Box sx={{ mb: 2 }}>{form.qrCodeMode === 2 && <QrCodeTag />}</Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {/* {form.pdfFile && (
                <IconButton
                  aria-label="delete"
                  color="error"
                  onClick={handleFileRemove}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              )} */}
              {!form.pdfFile && (
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ marginBottom: 0 }}
                />
              )}
            </Box>

            {form.pdfFile && (
              <Box
                sx={{
                  maxWidth: 600,
                  width: "100%",
                  marginX: "auto",
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  overflow: "auto",
                }}
              >
                <PdfCanvasViewer
                  file={form.pdfFile}
                  flowItems={form.flowItems}
                  onItemDrop={(index, pageNumber, position) => {
                    setForm((prev) => {
                      const updatedItems = [...prev.flowItems];
                      updatedItems[index] = {
                        ...updatedItems[index],
                        page: pageNumber,
                        position,
                      };
                      console.log(updatedItems);
                      return { ...prev, flowItems: updatedItems };
                    });
                  }}
                  onQrCodeDrop={(
                    pageNumber,
                    position,
                    canvasWidth,
                    canvasHeight
                  ) => {
                    setForm((prev) => ({
                      ...prev,
                      qrCodePositions: {
                        ...prev.qrCodePositions,
                        [pageNumber]: position,
                        values: convertQrCodePosition(
                          position,
                          canvasWidth,
                          canvasHeight
                        ),
                      },
                    }));
                  }}
                  qrCodePositions={form.qrCodePositions}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            {form.flowItems.map((item, index) => (
              <FlowItemTag key={index} item={item} index={index} />
            ))}
          </Box>

          <Box mt={3}>
            <Typography variant="subtitle1">İmzacılar</Typography>
            {form.flowItems.map((item, index) => (
              <Paper
                key={index}
                sx={{ p: 2, mb: 2, overflowX: "auto" }}
                elevation={5}
              >
                <Grid2 container spacing={2} alignItems="center" wrap="nowrap">
                  <Grid2 size={3}>
                    <TextField
                      fullWidth
                      label="Ad Soyad"
                      value={item.fullname}
                      onChange={(e) =>
                        handleFlowItemChange(index, "fullname", e.target.value)
                      }
                    />
                  </Grid2>
                  <Grid2 size={3}>
                    <TextField
                      fullWidth
                      label="E-Posta"
                      value={item.eMail}
                      onChange={(e) =>
                        handleFlowItemChange(index, "eMail", e.target.value)
                      }
                    />
                  </Grid2>
                  <Grid2 size={1}>
                    <TextField
                      fullWidth
                      label="Sıra No"
                      type="number"
                      value={item.orderNo}
                      onChange={(e) =>
                        handleFlowItemChange(index, "orderNo", +e.target.value)
                      }
                    />
                  </Grid2>
                  <Grid2 size={1}>
                    <TextField
                      fullWidth
                      label="Grup No"
                      type="number"
                      value={item.groupNo}
                      onChange={(e) =>
                        handleFlowItemChange(index, "groupNo", +e.target.value)
                      }
                    />
                  </Grid2>
                  <Grid2 size={1.5}>
                    <FormControl fullWidth>
                      <InputLabel id={`flowItemType-${index}`}>Tip</InputLabel>
                      <Select
                        labelId={`flowItemType-${index}`}
                        value={item.flowItemType}
                        label="Tip"
                        onChange={(e) =>
                          handleFlowItemChange(
                            index,
                            "flowItemType",
                            +e.target.value
                          )
                        }
                      >
                        {flowItemTypes.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid2>
                  <Grid2 size={2}>
                    <FormControl fullWidth>
                      <InputLabel id={`groupAuthority-${index}`}>
                        Yetki
                      </InputLabel>
                      <Select
                        labelId={`groupAuthority-${index}`}
                        value={item.flowItemGroupAuthorityType}
                        label="Yetki"
                        onChange={(e) =>
                          handleFlowItemChange(
                            index,
                            "flowItemGroupAuthorityType",
                            +e.target.value
                          )
                        }
                      >
                        {flowItemGroupAuthorities.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid2>
                  <Grid2>
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={() => removeFlowItem(index)}
                      disabled={form.flowItems.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid2>
                </Grid2>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addFlowItem}
              sx={{ mb: 2 }}
            >
              İmzacı Ekle
            </Button>
          </Box>

          <Grid2 container spacing={1} sx={{ mt: 2 }}>
            <Grid2 size={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Notlar"
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
              />
            </Grid2>
          </Grid2>

          <Box mt={3}>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              Gönder
            </Button>
          </Box>
        </Paper>
      </Container>
    </DndProvider>
  );
}
