import { Button, Grid, Stack, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useAxios } from "../../hooks/useAxios";
import { Item } from "../item";
import { MAX_LINES } from "../../utils/constants";

const LOGS_API_ENDPOINT = "/logs";

const columns: GridColDef[] = [
  { field: "log", headerName: "Logs", width: 1120 },
];

interface FileViewerProps {
  file: string;
  onBack(): void;
}

export const FileViewer: React.FC<FileViewerProps> = (
  props: FileViewerProps
) => {
  const { file, onBack } = props;
  const [entries, setEntries] = useState(500);
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState(
    `${LOGS_API_ENDPOINT}/${encodeURIComponent(
      file.replace((process.env.REACT_APP_API_LOG_DIR as string) + "/", "")
    )}/entries/${entries}`
  );

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (query.length > 0) {
      return setUrl(
        `${LOGS_API_ENDPOINT}/${encodeURIComponent(
          file.replace((process.env.REACT_APP_API_LOG_DIR as string) + "/", "")
        )}/entries/${entries}?search=${query}`
      );
    }

    setUrl(
      `${LOGS_API_ENDPOINT}/${encodeURIComponent(
        file.replace((process.env.REACT_APP_API_LOG_DIR as string) + "/", "")
      )}/entries/${entries}`
    );
  };

  const handleSetEntries = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target as HTMLInputElement;
    setEntries(parseInt(value));
  };

  const handleSetQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target as HTMLInputElement;
    setQuery(value);
  };

  const renderForm = () => {
    return (
      <form autoComplete="off" onSubmit={handleSubmit}>
        <Item>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Item>
                <TextField
                  type="number"
                  defaultValue={entries}
                  fullWidth
                  id="standard-basic"
                  label={`Number of Logs to fetch (max  ${MAX_LINES} lines)`}
                  variant="standard"
                  onChange={handleSetEntries}
                />
              </Item>
            </Grid>
            <Grid item xs={4}>
              <Item>
                <TextField
                  defaultValue={query}
                  onChange={handleSetQuery}
                  fullWidth
                  id="standard-basic"
                  label="Search"
                  variant="standard"
                />
              </Item>
            </Grid>
            <Grid item xs={2} sx={{ marginTop: "12px" }}>
              <Button variant="contained" color="primary" type="submit">
                Submit
              </Button>
            </Grid>
            <Grid item xs={2} sx={{ marginTop: "12px" }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => onBack()}
              >
                Go Back
              </Button>
            </Grid>
          </Grid>
        </Item>
      </form>
    );
  };

  const { data, error, loaded } = useAxios(url, "GET");

  if (loaded) {
    // transform received data into expected format needed for DataGrid
    const rows = data
      ? (data["logs"] as string[]).map((log: string, index: number) => {
          return {
            log: log,
            id: index,
          };
        })
      : [];

    return error ? (
      <Stack spacing={2}>
        {renderForm()}
        <Item>
          <span>Error: {error}</span>
        </Item>
      </Stack>
    ) : (
      <>
        <Stack spacing={2}>
          {renderForm()}
          <Item>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 25,
                  },
                },
              }}
              disableRowSelectionOnClick
            />
          </Item>
        </Stack>
      </>
    );
  }

  return (
    <Stack spacing={2}>
      {renderForm()}
      <Item>Loading...</Item>
    </Stack>
  );
};
