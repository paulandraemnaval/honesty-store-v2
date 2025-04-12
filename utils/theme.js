import { createTheme } from "@mui/material/styles";
import { green } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ffffff",
    },
    secondary: {
      main: "#ff5722",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: green[500],
        },
      },
    },
  },
});

export default theme;
