import React from "react";
import { Box, MenuItem, TextField, Typography } from "@mui/material";
import { Field } from "formik";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { priorityLabel, TASK_PRIORITIES } from "domain/task";

const Label = ({ children, htmlFor }) => (
  <Typography
    component="label"
    htmlFor={htmlFor}
    variant="subtitle2"
    sx={{ display: "block", mb: 0.75 }}
  >
    {children}
  </Typography>
);

/**
 * All form inputs share one shape: label above, control, error text below, and
 * the error only after the field has been touched.
 */
export const FormTextField = ({
  name,
  label,
  placeholder,
  type = "text",
  multiline = false,
  rows,
  autoComplete,
  autoFocus = false,
}) => (
  <Field name={name}>
    {({ field, meta }) => {
      const showError = Boolean(meta.touched && meta.error);
      return (
        <Box sx={{ width: "100%" }}>
          {label && <Label htmlFor={name}>{label}</Label>}
          <TextField
            {...field}
            id={name}
            value={field.value ?? ""}
            type={type}
            fullWidth
            size="small"
            multiline={multiline}
            rows={rows}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
            placeholder={placeholder}
            error={showError}
            helperText={showError ? meta.error : " "}
            FormHelperTextProps={{ sx: { mx: 0.25, minHeight: 18 } }}
          />
        </Box>
      );
    }}
  </Field>
);

export const PrioritySelect = ({ name, label = "Priority" }) => (
  <Field name={name}>
    {({ field, form, meta }) => {
      const showError = Boolean(meta.touched && meta.error);
      return (
        <Box sx={{ width: "100%" }}>
          <Label htmlFor={name}>{label}</Label>
          <TextField
            select
            id={name}
            fullWidth
            size="small"
            value={field.value ?? ""}
            onChange={(event) => form.setFieldValue(name, event.target.value)}
            error={showError}
            helperText={showError ? meta.error : " "}
            FormHelperTextProps={{ sx: { mx: 0.25, minHeight: 18 } }}
          >
            {TASK_PRIORITIES.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priorityLabel(priority)}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      );
    }}
  </Field>
);

/** Formik stores the deadline as `YYYY-MM-DD`; the picker works in Date. */
export const DeadlineField = ({ name, label = "Deadline" }) => (
  <Field name={name}>
    {({ field, form, meta }) => {
      const showError = Boolean(meta.touched && meta.error);
      const value = field.value ? new Date(field.value) : null;
      return (
        <Box sx={{ width: "100%" }}>
          <Label htmlFor={name}>{label}</Label>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={value && !Number.isNaN(value.getTime()) ? value : null}
              format="yyyy-MM-dd"
              onChange={(next) =>
                form.setFieldValue(
                  name,
                  next && !Number.isNaN(next.getTime())
                    ? `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`
                    : null
                )
              }
              slotProps={{
                textField: {
                  id: name,
                  fullWidth: true,
                  size: "small",
                  error: showError,
                  helperText: showError ? meta.error : " ",
                  FormHelperTextProps: { sx: { mx: 0.25, minHeight: 18 } },
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      );
    }}
  </Field>
);
