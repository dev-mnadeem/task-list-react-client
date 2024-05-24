import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";

import { DeadlineField, FormTextField, PrioritySelect } from "components/shared/fields";
import { emptyTaskForm, taskFormSchema } from "modules/Tasks/taskFormSchema";

/**
 * One dialog serves create and edit. `initialValues` comes from the board, so a
 * quick-capture draft and a row being edited flow through the same validation.
 */
export const TaskFormDialog = ({
  open,
  mode,
  initialValues,
  submitting,
  onClose,
  onSubmit,
}) => {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Formik
        enableReinitialize
        initialValues={{ ...emptyTaskForm, ...initialValues }}
        validationSchema={taskFormSchema}
        onSubmit={onSubmit}
      >
        {() => (
          <Form noValidate>
            <DialogTitle component="div" sx={{ pb: 0.5 }}>
              <Typography variant="h2">{isEdit ? "Edit task" : "New task"}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {isEdit
                  ? "Changes are saved to the same task."
                  : "Everything except the title is optional."}
              </Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 2.5 }}>
              <FormTextField
                name="title"
                label="Title"
                placeholder="What needs doing?"
                autoFocus
              />
              <FormTextField
                name="description"
                label="Description"
                placeholder="Any detail worth remembering later"
                multiline
                rows={3}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <PrioritySelect name="priority" />
                <DeadlineField name="deadline" />
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={onClose} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? "Saving…" : isEdit ? "Save changes" : "Add task"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default TaskFormDialog;
