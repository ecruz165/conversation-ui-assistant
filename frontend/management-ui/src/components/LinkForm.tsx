import {
  Close as CloseIcon,
  Code as CodeIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { NavigationLink } from "~/types";

interface FormField {
  label: string;
  slot: string;
  type: "text" | "email" | "number" | "date" | "select" | "textarea";
  required: boolean;
}

interface LinkFormData {
  intent: string;
  displayName: string;
  targetUrl: string;
  isBookmarkable: boolean;
  startingPath?: string;
  description?: string;
  aiGuidance?: string;
  keywords: string[];
  hasForm: boolean;
  formFields: FormField[];
  screenshot?: File | null;
}

interface LinkFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<NavigationLink>) => Promise<void>;
  initialData?: Partial<NavigationLink>;
  mode?: "create" | "edit";
}

export function LinkForm({ open, onClose, onSubmit, initialData, mode = "create" }: LinkFormProps) {
  const [keywordInput, setKeywordInput] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    initialData?.screenshot || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedParameters, setDetectedParameters] = useState<string[]>([]);
  const [formFieldInput, setFormFieldInput] = useState<FormField>({
    label: "",
    slot: "",
    type: "text",
    required: true,
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LinkFormData>({
    defaultValues: {
      intent: initialData?.intent || "",
      displayName: initialData?.displayName || "",
      targetUrl: initialData?.targetUrl || "",
      isBookmarkable: initialData?.isBookmarkable ?? true,
      startingPath: initialData?.startingPath || "",
      description: initialData?.description || "",
      aiGuidance: initialData?.aiGuidance || "",
      keywords: initialData?.keywords || [],
      hasForm: initialData?.hasForm || false,
      formFields: initialData?.formFields || [],
      screenshot: null,
    },
  });

  const keywords = watch("keywords");
  const targetUrl = watch("targetUrl");
  const intent = watch("intent");
  const hasForm = watch("hasForm");
  const formFields = watch("formFields");
  const isBookmarkable = watch("isBookmarkable");

  // Auto-generate intent from URL and auto-detect parameters
  useEffect(() => {
    if (targetUrl && !intent && mode === "create") {
      // Extract path without query params or fragments
      const path = targetUrl.split("?")[0].split("#")[0];

      // Remove leading slash and replace remaining slashes with underscores
      // Remove {params} and convert to intent format
      const generatedIntent = path
        .replace(/^\//, "")
        .replace(/\{[^}]+\}/g, "")
        .replace(/\//g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
        .toLowerCase();

      if (generatedIntent) {
        setValue("intent", generatedIntent);
      }
    }

    // Auto-detect parameters in URLs (e.g., /portfolios/{account})
    if (targetUrl) {
      const paramRegex = /\{([^}]+)\}/g;
      const matches = [...targetUrl.matchAll(paramRegex)];
      const params = matches.map((match) => match[1]);
      setDetectedParameters(params);

      // Auto-detect if URL has parameters - likely not bookmarkable
      if (params.length > 0 && mode === "create") {
        setValue("isBookmarkable", false);
      }
    } else {
      setDetectedParameters([]);
    }
  }, [targetUrl, intent, mode, setValue]);

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      setValue("keywords", [...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setValue(
      "keywords",
      keywords.filter((_, i) => i !== index)
    );
  };

  const handleAddFormField = () => {
    if (formFieldInput.label.trim() && formFieldInput.slot.trim()) {
      setValue("formFields", [...formFields, formFieldInput]);
      setFormFieldInput({
        label: "",
        slot: "",
        type: "text",
        required: true,
      });
    }
  };

  const handleRemoveFormField = (index: number) => {
    setValue(
      "formFields",
      formFields.filter((_, i) => i !== index)
    );
  };

  const handleScreenshotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("screenshot", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data: LinkFormData) => {
    setIsSubmitting(true);
    try {
      const linkData: Partial<NavigationLink> = {
        intent: data.intent.toLowerCase().trim(),
        displayName: data.displayName,
        targetUrl: data.targetUrl,
        isBookmarkable: data.isBookmarkable,
        startingPath: data.startingPath,
        description: data.description,
        aiGuidance: data.aiGuidance,
        keywords: data.keywords,
        screenshot: screenshotPreview || undefined,
        // Add detected parameters from URL slots (e.g., {account})
        parameters:
          detectedParameters.length > 0
            ? detectedParameters.map((param) => ({
                name: param,
                description: `The ${param} parameter`,
                required: true,
              }))
            : undefined,
        // Add form fields if page has a form
        hasForm: data.hasForm,
        formFields: data.hasForm && data.formFields.length > 0 ? data.formFields : undefined,
        // In edit mode, preserve existing fields
        ...(mode === "edit" && initialData ? { id: initialData.id } : {}),
      };
      await onSubmit(linkData);
      reset();
      setScreenshotPreview(null);
      setDetectedParameters([]);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setScreenshotPreview(null);
    setKeywordInput("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{mode === "edit" ? "Edit Navigation Link" : "Add Navigation Link"}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Path (Target URL) */}
          <Controller
            name="targetUrl"
            control={control}
            rules={{
              required: "Target URL is required",
              pattern: {
                value: /^[/].*|^https?:\/\/.+/,
                message: "Must be a valid path (e.g., /dashboard) or URL (e.g., https://...)",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Target URL / Path"
                required
                fullWidth
                placeholder="/dashboard or /portfolios/{account}"
                error={!!errors.targetUrl}
                helperText={
                  errors.targetUrl?.message ||
                  "Use {paramName} for dynamic segments (e.g., /users/{id})"
                }
              />
            )}
          />

          {/* Path/Query Param Slots */}
          {detectedParameters.length > 0 && (
            <Alert severity="info" icon={<CodeIcon />}>
              <Typography variant="subtitle2" className="font-semibold mb-1">
                Path/Query Param Slots
              </Typography>
              <Typography variant="body2" className="mb-2">
                AI will collect these values from user before navigation:
              </Typography>
              <Box className="flex flex-wrap gap-1">
                {detectedParameters.map((param) => (
                  <Chip key={param} label={param} size="small" color="primary" variant="outlined" />
                ))}
              </Box>
            </Alert>
          )}

          {/* Title (Display Name) */}
          <Controller
            name="displayName"
            control={control}
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                required
                fullWidth
                error={!!errors.displayName}
                helperText={errors.displayName?.message || "Page title shown to users"}
              />
            )}
          />

          {/* Page Type */}
          <Controller
            name="isBookmarkable"
            control={control}
            render={({ field }) => (
              <FormControl>
                <FormLabel>Page Type</FormLabel>
                <RadioGroup
                  value={field.value ? "bookmarkable" : "journey"}
                  onChange={(e) => field.onChange(e.target.value === "bookmarkable")}
                >
                  <FormControlLabel
                    value="bookmarkable"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2">Bookmarkable</Typography>
                        <Typography variant="caption" className="text-gray-600">
                          Users can navigate directly via URL
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="journey"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2">Journey</Typography>
                        <Typography variant="caption" className="text-gray-600">
                          Requires user input or interaction
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            )}
          />

          {/* Starting Path - Only for Journey pages */}
          {!isBookmarkable && (
            <Controller
              name="startingPath"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Starting Path"
                  fullWidth
                  placeholder="/dashboard"
                  helperText="The page/URL where users start before reaching this journey endpoint"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontFamily: "monospace",
                    },
                  }}
                />
              )}
            />
          )}

          {/* Keywords */}
          <Box>
            <FormLabel>Keywords (Optional)</FormLabel>
            <Box className="flex gap-2 mt-2 mb-2">
              <TextField
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="Add keyword"
                size="small"
                fullWidth
              />
              <Button onClick={handleAddKeyword} variant="outlined">
                Add
              </Button>
            </Box>
            <Box className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  onDelete={() => handleRemoveKeyword(index)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          {/* Description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                multiline
                rows={3}
                helperText="Brief description of what this page does"
              />
            )}
          />

          {/* Page Has Form */}
          <Controller
            name="hasForm"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="This page contains a form that needs to be filled"
              />
            )}
          />

          {/* Form Fields Configuration */}
          {hasForm && (
            <Box className="p-4 border border-gray-300 rounded">
              <Typography variant="subtitle2" className="font-semibold mb-2">
                Form Fields
              </Typography>
              <Typography variant="caption" className="text-gray-600 block mb-3">
                Define the form fields that the AI should help users fill out
              </Typography>

              {/* Add Form Field Inputs */}
              <Stack spacing={2} className="mb-3">
                <Box className="grid grid-cols-2 gap-2">
                  <TextField
                    label="Field Label"
                    value={formFieldInput.label}
                    onChange={(e) =>
                      setFormFieldInput({ ...formFieldInput, label: e.target.value })
                    }
                    size="small"
                  />
                  <TextField
                    label="Slot Name"
                    value={formFieldInput.slot}
                    onChange={(e) => setFormFieldInput({ ...formFieldInput, slot: e.target.value })}
                    size="small"
                  />
                </Box>
                <Box className="grid grid-cols-2 gap-2">
                  <FormControl size="small" fullWidth>
                    <FormLabel sx={{ fontSize: "0.75rem" }}>Type</FormLabel>
                    <Select
                      value={formFieldInput.type}
                      onChange={(e) =>
                        setFormFieldInput({
                          ...formFieldInput,
                          type: e.target.value as FormField["type"],
                        })
                      }
                    >
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="date">Date</MenuItem>
                      <MenuItem value="select">Select</MenuItem>
                      <MenuItem value="textarea">Textarea</MenuItem>
                    </Select>
                  </FormControl>
                  <Box className="flex items-center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formFieldInput.required}
                          onChange={(e) =>
                            setFormFieldInput({
                              ...formFieldInput,
                              required: e.target.checked,
                            })
                          }
                          size="small"
                        />
                      }
                      label="Required"
                    />
                  </Box>
                </Box>
                <Button onClick={handleAddFormField} variant="outlined" size="small" fullWidth>
                  Add Field
                </Button>
              </Stack>

              {/* Display Added Form Fields */}
              {formFields.length > 0 && (
                <Box className="space-y-2">
                  <Typography variant="caption" className="text-gray-600">
                    Defined Fields:
                  </Typography>
                  {formFields.map((field, index) => (
                    <Paper key={`${field.label}-${field.slot}`} variant="outlined" className="p-2">
                      <Box className="flex justify-between items-start">
                        <Box className="flex-1">
                          <Box className="flex items-center gap-2 mb-1">
                            <Typography variant="body2" className="font-medium">
                              {field.label}
                            </Typography>
                            <Chip label={field.slot} size="small" variant="outlined" />
                            <Chip label={field.type} size="small" color="primary" />
                            {field.required && <Chip label="Required" size="small" color="error" />}
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFormField(index)}
                          color="error"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* AI Guidance */}
          <Controller
            name="aiGuidance"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="AI Guidance (Optional)"
                fullWidth
                multiline
                rows={3}
                helperText="Optional guidance for AI to understand the page and how to navigate to it"
              />
            )}
          />

          {/* Screenshot Upload */}
          <Box>
            <FormLabel>Screenshot (Optional)</FormLabel>
            <Typography variant="caption" className="text-gray-600 block mb-2">
              Upload a screenshot to help AI understand the page layout
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ mt: 1 }}
            >
              Upload Screenshot
              <input type="file" hidden accept="image/*" onChange={handleScreenshotChange} />
            </Button>
            {screenshotPreview && (
              <Box className="relative mt-3">
                <IconButton
                  size="small"
                  onClick={() => {
                    setScreenshotPreview(null);
                    setValue("screenshot", null);
                  }}
                  className="absolute top-2 right-2 bg-white"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="w-full max-h-64 object-contain border border-gray-300 rounded"
                />
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? mode === "edit"
              ? "Saving..."
              : "Adding..."
            : mode === "edit"
              ? "Save Changes"
              : "Add Link"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
