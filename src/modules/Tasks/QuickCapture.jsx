import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  InputBase,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import { palette } from "theme";
import { parseTask } from "services/ai";
import { priorityLabel } from "domain/task";

const EXAMPLES = [
  "Send the retro notes to Ana by Friday !high",
  "Renew the domain in 2 weeks",
  "Draft the launch email tomorrow - keep it under 150 words",
];

/**
 * Natural-language task capture.
 *
 * The input goes to whichever parser the AI registry resolves; the local one is
 * a deterministic rule parser that needs no key and no network, so this control
 * behaves identically on a fresh clone and with a model configured. The parsed
 * draft is shown for confirmation — it opens the form, it never writes a task.
 */
export const QuickCapture = ({ onDraft }) => {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (value) => {
    const source = (value ?? text).trim();
    if (!source) return;
    setBusy(true);
    try {
      const draft = await parseTask(source);
      setPreview(draft);
      onDraft(draft);
      setText("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper sx={{ p: 2.25 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
        <AutoAwesomeRoundedIcon sx={{ fontSize: 17, color: palette.brand }} />
        <Typography variant="subtitle1">Quick capture</Typography>
        <Tooltip title="Dates, priorities and a trailing description are pulled out of the sentence">
          <Typography variant="caption" sx={{ cursor: "help" }}>
            how does this work?
          </Typography>
        </Tooltip>
      </Box>

      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          run();
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          border: `1px solid ${palette.border}`,
          borderRadius: 2.5,
          px: 1.75,
          py: 0.5,
          transition: "border-color 120ms ease",
          "&:focus-within": { borderColor: palette.brand },
        }}
      >
        <InputBase
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ship the changelog by next Friday !high"
          inputProps={{ "aria-label": "Describe a task in plain language" }}
          sx={{ flex: 1, fontSize: "0.9375rem", py: 0.75 }}
        />
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={busy || !text.trim()}
        >
          {busy ? "Reading…" : "Parse"}
        </Button>
      </Box>

      {preview ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
            mt: 1.75,
            alignItems: "center",
          }}
        >
          <Typography variant="caption">Parsed as</Typography>
          <Chip size="small" label={preview.title || "untitled"} />
          <Chip size="small" label={priorityLabel(preview.priority)} />
          <Chip size="small" label={preview.deadline ?? "no deadline"} />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            via {preview.provider} parser
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
            mt: 1.75,
            alignItems: "center",
          }}
        >
          <Typography variant="caption">Try</Typography>
          {EXAMPLES.map((example) => (
            <Chip
              key={example}
              size="small"
              label={example}
              variant="outlined"
              onClick={() => run(example)}
              sx={{ fontWeight: 500, cursor: "pointer", borderColor: palette.border }}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default QuickCapture;
