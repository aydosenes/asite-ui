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
  Tooltip,
  TextField,
  Stack,
  Grid2,
} from "@mui/material";
import { use } from "react";
import * as XLSX from "xlsx";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function Final({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [endpoint, setEndpoint] = useState("");
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      const content = `${process.env.BASE_URL}/api/Asite/${endpoint}`;
      //await navigator.clipboard.writeText(content);
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const [handled, setHandled] = useState(false);
  const handleEndpoint = async () => {
    try {
      fetch(`${process.env.BASE_URL}/api/Asite/generate-endpoint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: endpoint,
          mappingId: unwrappedParams.mappingId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            setHandled(true);
          }
        })
        .catch((error) => console.log(error));
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  return (
    <Container maxWidth="md">
      <FormControl fullWidth variant="outlined" margin="normal">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ alignItems: "center", paddingTop: 2 }}>
            {process.env.BASE_URL}
          </Typography>
          <TextField
            id="standard-basic"
            label="Your Endpoint"
            variant="standard"
            size="small"
            value={endpoint}
            onChange={(e) => {
              setEndpoint(e.target.value);
            }}
          />
          <Tooltip title={copied ? "Copied!" : "Copy"} arrow>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCopy}
              startIcon={<ContentCopyIcon />}
              disabled={endpoint == ""}
            >
              Copy
            </Button>
          </Tooltip>
        </Stack>
      </FormControl>
      <Grid2 container spacing={2} direction="row" mt={3}>
        <Grid2 item size={4}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => handleEndpoint()}
            disabled={handled || endpoint == ""}
            fullWidth
          >
            GENERATE ENDPOINT
          </Button>
        </Grid2>
        <Grid2 item size={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() =>
              router.push(
                `/asite/${decodeURIComponent(
                  unwrappedParams.sessionId
                )}/mapping/${unwrappedParams.userId}`
              )
            }
            fullWidth
          >
            NEW MAPPING
          </Button>
        </Grid2>
      </Grid2>
    </Container>
  );
}
