import { Box, MenuItem, TextField, Typography } from "@mui/material";
import { Field } from "formik";

import { priorityLabel, TASK_PRIORITIES } from "domain/task";

export const FieldLabel = ({ children, htmlFor }) => (
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
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
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
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
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
