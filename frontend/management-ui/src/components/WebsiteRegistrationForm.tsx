import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { Website } from "~/types";

interface ScannableDomain {
  url: string;
  isActiveForScanning: boolean;
  requiresCredentials: boolean;
  credentials?: {
    username: string;
    password: string;
  };
}

interface WebsiteFormData {
  name: string;
  type: "website" | "internal_app" | "mobile_app";
  description: string;
  containsPII: boolean;
  contact: {
    name: string;
    email: string;
    department: string;
    phone: string;
  };
  domains: {
    primary: string;
    scannableDomains: ScannableDomain[];
  };
}

interface WebsiteRegistrationFormProps {
  onSubmit: (data: Partial<Website>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<WebsiteFormData>;
  mode?: "create" | "edit";
}

const FORM_STORAGE_KEY = "website-registration-form";
const SECTION_TITLE_CLASS = "display-block pb-2 font-semibold text-gray-900";

export function WebsiteRegistrationForm({
  onSubmit,
  onCancel,
  initialData,
  mode = "create",
}: WebsiteRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WebsiteFormData>({
    defaultValues: initialData || {
      name: "",
      type: "website",
      description: "",
      containsPII: false,
      contact: {
        name: "",
        email: "",
        department: "",
        phone: "",
      },
      domains: {
        primary: "",
        scannableDomains: [],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "domains.scannableDomains",
  });

  // Watch for PII changes and auto-add domain field when PII = Yes
  const containsPII = watch("containsPII");
  useEffect(() => {
    if (containsPII && fields.length === 0) {
      // Automatically add one domain field when PII is selected
      append({
        url: "",
        isActiveForScanning: true,
        requiresCredentials: true,
        credentials: { username: "", password: "" },
      });
    }
  }, [containsPII, fields.length, append]);

  // Auto-save to localStorage
  const formValues = watch();
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formValues));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formValues]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!initialData) {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          // Reset form with saved data (React Hook Form will handle this internally)
        } catch (e) {
          console.error("Failed to load saved form data", e);
        }
      }
    }
  }, [initialData]);

  const onSubmitForm = async (data: WebsiteFormData) => {
    // Validate PII-related requirements
    if (data.containsPII) {
      if (!data.domains.scannableDomains || data.domains.scannableDomains.length === 0) {
        alert("At least one non-production domain is required when handling PII");
        return;
      }
      // Validate that all domains have credentials (required by default)
      const allHaveCredentials = data.domains.scannableDomains.every(
        (domain) => domain.credentials?.username && domain.credentials?.password
      );
      if (!allHaveCredentials) {
        alert("All non-production domains must have test credentials");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Transform form data to match Website type
      const websiteData: Partial<Website> = {
        name: data.name,
        type: data.type,
        description: data.description,
        contact: {
          name: data.contact.name,
          email: data.contact.email,
          department: data.contact.department || undefined,
          phone: data.contact.phone || undefined,
        },
        domains: {
          primary: data.domains.primary,
          scannableDomains: data.domains.scannableDomains.map((d) => ({
            domain: d.url,
            isActive: d.isActiveForScanning,
          })),
        },
      };
      await onSubmit(websiteData);
      localStorage.removeItem(FORM_STORAGE_KEY);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const confirmMessage =
      mode === "edit"
        ? "Are you sure you want to cancel? Unsaved changes will be lost."
        : "Are you sure you want to cancel? Unsaved changes will be lost.";
    if (window.confirm(confirmMessage)) {
      if (mode === "create") {
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
      onCancel();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitForm)} className="max-w-4xl mx-auto p-6">
      <Stack spacing={4}>
        {/* Website Information Section */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className={SECTION_TITLE_CLASS}>
            Website Information
          </Typography>
          <Stack spacing={3}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Website name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Website Name"
                  required
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset">
                  <FormLabel component="legend">Website Type</FormLabel>
                  <RadioGroup {...field} row>
                    <FormControlLabel value="website" control={<Radio />} label="Website" />
                    <FormControlLabel
                      value="internal_app"
                      control={<Radio />}
                      label="Internal App"
                    />
                    <FormControlLabel value="mobile_app" control={<Radio />} label="Mobile App" />
                  </RadioGroup>
                </FormControl>
              )}
            />

            <Controller
              name="description"
              control={control}
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  required
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Stack>
        </Paper>

        {/* Data Privacy & Security Section */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className={SECTION_TITLE_CLASS}>
            Data Privacy & Security
          </Typography>
          <Stack spacing={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend" required>
                Does this application contain Personal Identifiable Information (PII) or sensitive
                user data?
              </FormLabel>
              <Typography variant="caption" className="text-gray-600 mt-1 mb-2">
                PII includes: names, email addresses, phone numbers, social security numbers,
                financial data, health records, or any other personal user information.
              </Typography>
              <Controller
                name="containsPII"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    value={field.value ? "yes" : "no"}
                    onChange={(e) => field.onChange(e.target.value === "yes")}
                    row
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                )}
              />
            </FormControl>

            {watch("containsPII") && (
              <Alert severity="warning" icon={<InfoIcon />} sx={{ backgroundColor: "#fef3c7" }}>
                <Typography variant="subtitle2" className="font-semibold mb-2">
                  Protected Data Requirements
                </Typography>
                <Typography variant="body2" className="mb-2">
                  To protect end-user privacy and sensitive information, you must provide:
                </Typography>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>At least one non-production environment domain (dev, staging, QA, etc.)</li>
                  <li>Test user credentials for scanning the non-production environment</li>
                </ul>
                <Typography variant="caption" className="text-gray-700 mt-2 block">
                  This ensures our scanning tools do not expose real user data during security
                  assessments.
                </Typography>
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* Contact Information Section */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className={SECTION_TITLE_CLASS}>
            Contact Information
          </Typography>
          <Stack spacing={3}>
            <Controller
              name="contact.name"
              control={control}
              rules={{ required: "Contact name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contact Name"
                  required
                  fullWidth
                  autoComplete="off"
                  error={!!errors.contact?.name}
                  helperText={errors.contact?.name?.message}
                />
              )}
            />

            <Controller
              name="contact.email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  required
                  fullWidth
                  autoComplete="off"
                  error={!!errors.contact?.email}
                  helperText={errors.contact?.email?.message}
                  sx={{
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px white inset",
                      WebkitTextFillColor: "inherit",
                    },
                  }}
                />
              )}
            />

            <Controller
              name="contact.department"
              control={control}
              rules={{ required: "Department is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Department"
                  required
                  fullWidth
                  autoComplete="off"
                  error={!!errors.contact?.department}
                  helperText={errors.contact?.department?.message}
                />
              )}
            />

            <Controller
              name="contact.phone"
              control={control}
              rules={{
                required: "Phone number is required",
                validate: (value) => {
                  const digitsOnly = value.replace(/\D/g, "");
                  return digitsOnly.length === 10 || "Phone number must be exactly 10 digits";
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone"
                  required
                  fullWidth
                  autoComplete="off"
                  placeholder="(555) 555-0123"
                  error={!!errors.contact?.phone}
                  helperText={errors.contact?.phone?.message}
                  onBlur={(e) => {
                    // Remove all non-digits
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    // Format as (XXX) XXX-XXXX if we have 10 digits
                    if (digitsOnly.length === 10) {
                      const formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
                      field.onChange(formatted);
                    } else {
                      field.onChange(digitsOnly);
                    }
                    field.onBlur();
                  }}
                />
              )}
            />
          </Stack>
        </Paper>

        {/* Domain Configuration Section */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className={SECTION_TITLE_CLASS}>
            Domain Configuration
          </Typography>
          <Stack spacing={3}>
            <Controller
              name="domains.primary"
              control={control}
              rules={{
                required: "Primary domain is required",
                pattern: {
                  value: /^https?:\/\/.+\..+/,
                  message: "Invalid URL (must include protocol, e.g., https://example.com)",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Primary Domain"
                  required
                  fullWidth
                  placeholder="https://example.com"
                  error={!!errors.domains?.primary}
                  helperText={errors.domains?.primary?.message}
                />
              )}
            />

            {/* Non-Production Domain Section - Only show when containsPII = true */}
            {watch("containsPII") && (
              <Box>
                <Box className="flex items-center justify-between mb-3">
                  <Box>
                    <Typography variant="subtitle1" className="font-medium text-gray-700">
                      Non-Production Domain to Scan <span className="text-red-600">*</span>
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      Provide test/dev/staging environment URLs with credentials for each domain
                    </Typography>
                  </Box>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      append({
                        url: "",
                        isActiveForScanning: true,
                        requiresCredentials: true,
                        credentials: { username: "", password: "" },
                      })
                    }
                  >
                    Add Domain
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {fields.map((field, index) => {
                    const domainUrl =
                      watch(`domains.scannableDomains.${index}.url`) || "New Domain";

                    return (
                      <Accordion key={field.id} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box className="flex items-center justify-between w-full pr-2">
                            <Typography className="font-medium text-gray-900">
                              {domainUrl}
                            </Typography>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                remove(index);
                              }}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </AccordionSummary>

                        <AccordionDetails>
                          <Stack spacing={3}>
                            <Controller
                              name={`domains.scannableDomains.${index}.url`}
                              control={control}
                              rules={{
                                required: "Domain URL is required",
                                pattern: {
                                  value: /^https?:\/\/.+\..+/,
                                  message:
                                    "Invalid URL (must include protocol, e.g., https://dev.example.com)",
                                },
                              }}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  placeholder="https://dev.example.com"
                                  label="Domain URL"
                                  required
                                  error={!!errors.domains?.scannableDomains?.[index]?.url}
                                  helperText={
                                    errors.domains?.scannableDomains?.[index]?.url?.message
                                  }
                                />
                              )}
                            />

                            <Box className="pl-8 pt-2 pb-2 pr-4 bg-blue-50 rounded border border-blue-200">
                              <Typography variant="subtitle2" className="mb-3 text-blue-900">
                                Test User Credentials for {domainUrl}
                              </Typography>
                              <Stack spacing={2}>
                                <Controller
                                  name={`domains.scannableDomains.${index}.credentials.username`}
                                  control={control}
                                  rules={{
                                    required:
                                      "Username is required for non-production domain scanning",
                                  }}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      label="Username"
                                      size="small"
                                      required
                                      fullWidth
                                      autoComplete="off"
                                      error={
                                        !!errors.domains?.scannableDomains?.[index]?.credentials
                                          ?.username
                                      }
                                      helperText={
                                        errors.domains?.scannableDomains?.[index]?.credentials
                                          ?.username?.message
                                      }
                                    />
                                  )}
                                />

                                <Controller
                                  name={`domains.scannableDomains.${index}.credentials.password`}
                                  control={control}
                                  rules={{
                                    required:
                                      "Password is required for non-production domain scanning",
                                  }}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      label="Password"
                                      type="password"
                                      size="small"
                                      required
                                      fullWidth
                                      autoComplete="new-password"
                                      error={
                                        !!errors.domains?.scannableDomains?.[index]?.credentials
                                          ?.password
                                      }
                                      helperText={
                                        errors.domains?.scannableDomains?.[index]?.credentials
                                          ?.password?.message
                                      }
                                      sx={{
                                        "& input:-webkit-autofill": {
                                          WebkitBoxShadow: "0 0 0 1000px #eff6ff inset",
                                          WebkitTextFillColor: "inherit",
                                        },
                                      }}
                                    />
                                  )}
                                />
                              </Stack>
                            </Box>
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                  {fields.length === 0 && (
                    <Typography variant="body2" className="text-gray-500 italic">
                      No non-production domains added yet. Click "Add Domain" to begin.
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Form Actions */}
        <Box className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outlined"
            size="large"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting
              ? mode === "edit"
                ? "Saving..."
                : "Registering..."
              : mode === "edit"
                ? "Save Changes"
                : "Register Website"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
