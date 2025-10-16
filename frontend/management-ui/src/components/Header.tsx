import { Menu as MenuIcon } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "white",
        borderBottom: "1px solid rgb(229, 231, 235)", // border-gray-200
      }}
    >
      <Toolbar>
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:bg-primary-600 focus:text-white focus:rounded"
        >
          Skip to content
        </a>

        {/* Mobile menu button */}
        {showMenuButton && (
          <IconButton
            edge="start"
            color="default"
            aria-label="menu"
            onClick={onMenuClick}
            className="mr-2 md:hidden"
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <Box className="w-10 h-10 bg-gray-800 rounded" />
          <Typography variant="h6" className="text-gray-700 font-medium">
            Access 360 Console
          </Typography>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
