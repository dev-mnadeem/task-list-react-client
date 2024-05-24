import React from "react";
import { Avatar, Box, Button, Container, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useDispatch, useSelector } from "react-redux";

import { palette } from "theme";
import { selectUser, signOut } from "store/authSlice";

const initialsOf = (user) => {
  const first = user?.first_name?.[0] ?? "";
  const last = user?.last_name?.[0] ?? "";
  const initials = `${first}${last}`.trim();
  return initials || (user?.email?.[0] ?? "?").toUpperCase();
};

export const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: palette.surface,
        borderBottom: `1px solid ${palette.border}`,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                backgroundColor: palette.brand,
                color: "#fff",
              }}
            >
              <CheckRoundedIcon sx={{ fontSize: 19 }} />
            </Box>
            <Typography variant="h3" sx={{ letterSpacing: "-0.01em" }}>
              Task Vault
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  backgroundColor: palette.brandSoft,
                  color: palette.brand,
                }}
              >
                {initialsOf(user)}
              </Avatar>
              <Box sx={{ lineHeight: 1.2 }}>
                <Typography variant="subtitle2" sx={{ color: palette.ink }}>
                  {[user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
                    "Signed in"}
                </Typography>
                <Typography variant="caption">{user?.email}</Typography>
              </Box>
            </Box>
            <Button
              size="small"
              color="inherit"
              startIcon={<LogoutRoundedIcon sx={{ fontSize: 17 }} />}
              onClick={() => dispatch(signOut())}
              sx={{ color: palette.inkMuted }}
            >
              Sign out
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Header;
