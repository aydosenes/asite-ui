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
import DeleteIcon from "@mui/icons-material/Delete";

export default function Asite({ params }) {
    const unwrappedParams = use(params);
    const [formTemplateId, setFormTemplateId] = useState("");
    const [projectId, setProjectId] = useState("");
    useEffect(() => {

    }, []);

    const handleGetCraneFormData = async () => {
        console.log("ok");
    };

    return (
        <Container maxWidth="md" sx={{ pb: 20 }}>
            <FormControl fullWidth variant="outlined" margin="normal">
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
                        disabled={!formTemplateId || !projectId}
                    >
                        {`Search`}
                    </Button>
                </Box>
            </FormControl>
        </Container>
    )
}