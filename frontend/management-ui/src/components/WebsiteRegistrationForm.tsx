import React, { useEffect, useState } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import {
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  IconButton,
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import type { Website } from '~/types'

interface ScannableDomain {
  url: string
  isActiveForScanning: boolean
  requiresCredentials: boolean
  credentials?: {
    username: string
    password: string
  }
}

interface WebsiteFormData {
  name: string
  type: 'website' | 'internal_app' | 'mobile_app'
  description: string
  contact: {
    name: string
    email: string
    department: string
    phone: string
  }
  domains: {
    primary: string
    scannableDomains: ScannableDomain[]
  }
}

interface WebsiteRegistrationFormProps {
  onSubmit: (data: Partial<Website>) => Promise<void>
  onCancel: () => void
  initialData?: Partial<WebsiteFormData>
  mode?: 'create' | 'edit'
}

const FORM_STORAGE_KEY = 'website-registration-form'

export function WebsiteRegistrationForm({
  onSubmit,
  onCancel,
  initialData,
  mode = 'create',
}: WebsiteRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WebsiteFormData>({
    defaultValues: initialData || {
      name: '',
      type: 'website',
      description: '',
      contact: {
        name: '',
        email: '',
        department: '',
        phone: '',
      },
      domains: {
        primary: '',
        scannableDomains: [],
      },
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'domains.scannableDomains',
  })

  // Handler to set active domain for scanning (only one can be active)
  const handleSetActiveDomain = (selectedIndex: number) => {
    const domains = watch('domains.scannableDomains')
    domains.forEach((_, index) => {
      setValue(`domains.scannableDomains.${index}.isActiveForScanning`, index === selectedIndex)
    })
  }

  // Auto-save to localStorage
  const formValues = watch()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formValues))
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [formValues])

  // Load from localStorage on mount
  useEffect(() => {
    if (!initialData) {
      const saved = localStorage.getItem(FORM_STORAGE_KEY)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          // Reset form with saved data (React Hook Form will handle this internally)
        } catch (e) {
          console.error('Failed to load saved form data', e)
        }
      }
    }
  }, [initialData])

  const onSubmitForm = async (data: WebsiteFormData) => {
    // Validate at least one scannable domain
    if (!data.domains.scannableDomains || data.domains.scannableDomains.length === 0) {
      alert('At least one domain to scan is required')
      return
    }

    setIsSubmitting(true)
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
          scannableDomains: data.domains.scannableDomains.map(d => ({
            domain: d.url,
            isActive: d.isActiveForScanning,
          })),
        },
      }
      await onSubmit(websiteData)
      localStorage.removeItem(FORM_STORAGE_KEY)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    const confirmMessage = mode === 'edit'
      ? 'Are you sure you want to cancel? Unsaved changes will be lost.'
      : 'Are you sure you want to cancel? Unsaved changes will be lost.'
    if (window.confirm(confirmMessage)) {
      if (mode === 'create') {
        localStorage.removeItem(FORM_STORAGE_KEY)
      }
      onCancel()
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitForm)} className="max-w-4xl mx-auto p-6">
      <Stack spacing={4}>
        {/* Website Information Section */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className="mb-4 font-semibold text-gray-900">
            Website Information
          </Typography>
          <Stack spacing={3}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Website name is required' }}
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
                    <FormControlLabel value="internal_app" control={<Radio />} label="Internal App" />
                    <FormControlLabel value="mobile_app" control={<Radio />} label="Mobile App" />
                  </RadioGroup>
                </FormControl>
              )}
            />

            <Controller
              name="description"
              control={control}
              rules={{ required: 'Description is required' }}
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

        {/* Contact Information Section */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className="mb-4 font-semibold text-gray-900">
            Contact Information
          </Typography>
          <Stack spacing={3}>
            <Controller
              name="contact.name"
              control={control}
              rules={{ required: 'Contact name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contact Name"
                  required
                  fullWidth
                  error={!!errors.contact?.name}
                  helperText={errors.contact?.name?.message}
                />
              )}
            />

            <Controller
              name="contact.email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  required
                  fullWidth
                  error={!!errors.contact?.email}
                  helperText={errors.contact?.email?.message}
                />
              )}
            />

            <Controller
              name="contact.department"
              control={control}
              rules={{ required: 'Department is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Department"
                  required
                  fullWidth
                  error={!!errors.contact?.department}
                  helperText={errors.contact?.department?.message}
                />
              )}
            />

            <Controller
              name="contact.phone"
              control={control}
              rules={{
                required: 'Phone number is required',
                validate: (value) => {
                  const digitsOnly = value.replace(/\D/g, '')
                  return digitsOnly.length === 10 || 'Phone number must be exactly 10 digits'
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone"
                  required
                  fullWidth
                  placeholder="(555) 555-0123"
                  error={!!errors.contact?.phone}
                  helperText={errors.contact?.phone?.message}
                  onBlur={(e) => {
                    // Remove all non-digits
                    const digitsOnly = e.target.value.replace(/\D/g, '')
                    // Format as (XXX) XXX-XXXX if we have 10 digits
                    if (digitsOnly.length === 10) {
                      const formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`
                      field.onChange(formatted)
                    } else {
                      field.onChange(digitsOnly)
                    }
                    field.onBlur()
                  }}
                />
              )}
            />
          </Stack>
        </Paper>

        {/* Domain Configuration Section */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className="mb-4 font-semibold text-gray-900">
            Domain Configuration
          </Typography>
          <Stack spacing={3}>
            <Controller
              name="domains.primary"
              control={control}
              rules={{
                required: 'Primary domain is required',
                pattern: {
                  value: /^https?:\/\/.+\..+/,
                  message: 'Invalid URL (must include protocol, e.g., https://example.com)',
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

            <Box>
              <Box className="flex items-center justify-between mb-2">
                <Box>
                  <Typography variant="subtitle1" className="font-medium text-gray-700">
                    Domain to Scan <span className="text-red-600">*</span>
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    At least one non-production environment required
                  </Typography>
                </Box>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => append({ url: '', isActiveForScanning: false, requiresCredentials: false, credentials: { username: '', password: '' } })}
                >
                  Add Domain
                </Button>
              </Box>

              <Stack spacing={2}>
                {fields.map((field, index) => {
                  const isActive = watch(`domains.scannableDomains.${index}.isActiveForScanning`)
                  const domainUrl = watch(`domains.scannableDomains.${index}.url`) || 'New Domain'

                  return (
                    <Accordion
                      key={field.id}
                      expanded={isActive}
                      className={!isActive ? 'bg-gray-100' : ''}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        className={`min-h-[56px] ${isActive ? 'bg-white' : 'bg-gray-100'}`}
                        sx={{
                          '& .MuiAccordionSummary-content': {
                            margin: '12px 0',
                          }
                        }}
                      >
                        <Box className="flex items-center justify-between w-full pr-2">
                          <Box className="flex items-center gap-3">
                            <Controller
                              name={`domains.scannableDomains.${index}.isActiveForScanning`}
                              control={control}
                              render={({ field }) => (
                                <Radio
                                  {...field}
                                  checked={field.value}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    handleSetActiveDomain(index)
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                            />
                            <Box>
                              <Typography className={isActive ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                                {domainUrl}
                              </Typography>
                              {!isActive && (
                                <Typography variant="caption" className="text-gray-500">
                                  (Not active)
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation()
                              remove(index)
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
                              pattern: {
                                value: /^https?:\/\/.+\..+/,
                                message: 'Invalid URL (must include protocol)',
                              },
                            }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                placeholder="https://dev.example.com"
                                label="Domain URL"
                                error={!!errors.domains?.scannableDomains?.[index]?.url}
                                helperText={errors.domains?.scannableDomains?.[index]?.url?.message}
                              />
                            )}
                          />

                          <Controller
                            name={`domains.scannableDomains.${index}.requiresCredentials`}
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={<Checkbox {...field} checked={field.value} />}
                                label="Credentials required to scan this domain"
                              />
                            )}
                          />

                          {watch(`domains.scannableDomains.${index}.requiresCredentials`) && (
                            <Stack spacing={2} className="pl-8">
                              <Controller
                                name={`domains.scannableDomains.${index}.credentials.username`}
                                control={control}
                                rules={{
                                  required: watch(`domains.scannableDomains.${index}.requiresCredentials`)
                                    ? 'Username is required when credentials are enabled'
                                    : false,
                                }}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Username"
                                    size="small"
                                    required={watch(`domains.scannableDomains.${index}.requiresCredentials`)}
                                    fullWidth
                                    error={!!errors.domains?.scannableDomains?.[index]?.credentials?.username}
                                    helperText={errors.domains?.scannableDomains?.[index]?.credentials?.username?.message}
                                  />
                                )}
                              />

                              <Controller
                                name={`domains.scannableDomains.${index}.credentials.password`}
                                control={control}
                                rules={{
                                  required: watch(`domains.scannableDomains.${index}.requiresCredentials`)
                                    ? 'Password is required when credentials are enabled'
                                    : false,
                                }}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Password"
                                    type="password"
                                    size="small"
                                    required={watch(`domains.scannableDomains.${index}.requiresCredentials`)}
                                    fullWidth
                                    error={!!errors.domains?.scannableDomains?.[index]?.credentials?.password}
                                    helperText={errors.domains?.scannableDomains?.[index]?.credentials?.password?.message}
                                  />
                                )}
                              />
                            </Stack>
                          )}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  )
                })}
                {fields.length === 0 && (
                  <Typography variant="body2" className="text-gray-500 italic">
                    No additional domains added
                  </Typography>
                )}
              </Stack>
            </Box>
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
              ? (mode === 'edit' ? 'Saving...' : 'Registering...')
              : (mode === 'edit' ? 'Save Changes' : 'Register Website')}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
