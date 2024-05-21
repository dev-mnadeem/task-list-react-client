import { Box } from "@mui/material";
import { Field } from "formik";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { FieldLabel } from "components/shared/fields";
import { formatDay, parseDay } from "domain/day";

// Kept apart from fields.jsx so the date picker and date-fns load with the
// task form only, never with the sign-in page.
/** Formik stores the deadline as `YYYY-MM-DD`; the picker works in Date. */
export const DeadlineField = ({ name, label = "Deadline" }) => (
  <Field name={name}>
    {({ field, form, meta }) => {
      const showError = Boolean(meta.touched && meta.error);
      const value = field.value ? parseDay(field.value) : null;
      return (
        <Box sx={{ width: "100%" }}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={value && !Number.isNaN(value.getTime()) ? value : null}
              format="yyyy-MM-dd"
              onChange={(next) =>
                form.setFieldValue(
                  name,
                  next && !Number.isNaN(next.getTime()) ? formatDay(next) : null
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
export default DeadlineField;
