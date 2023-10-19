# Log Collection API

## Objective

> A customer has asked you for a way to provide on-demand monitoring of various unix-based servers without having to log into each individual machine and opening up the log files found in `/var/log`. The customer has asked for the ability to issue a REST request to a machine in order to retrieve logs from `/var/log` on the machine receiving the REST request.

This repo contains a [backend Express API](./backend) and [frontend React app](./frontend), both written in TypeScript. These projects were independently bootstrapped with starter templates, so there's a mix of some opinionated tooling throughout that leads to some nice developer ergonomics. There's still a bit more that could be accomlished to make this into a turn-key deployable app (namely a Dockerfile), but it's quite usable for a local dev environment today.

### Acceptance criteria

The main theme of the acceptance criteria had to do with building a REST API that could retrieve log lines from a given file. There are 3 endpoints available that satisfy these requirements:

```bash
# Returns a tree of nodes representing the directory tree at /var/log (this path is hard-coded in local .env file).
/logs

# Retrieves a log by name. By default we only return 500 lines, and at max 2000.
/logs/:logName
example: /logs/2023-10-17.log

# Retrieves a log by name along with the specified number of entries. By default we only return 500 lines, and at max 2000.
/logs/:logName/entries/:entries
example: /logs/2023-10-17.log/entries/500

# Plain-text search - via `search` query parameter
/logs/:logName/entries/:entries?search=<search_string>
example: /logs/2023-10-17.log/entries/100?search=🚀
```

### External Dependencies and the scheme behind the Search Algorithm

The actual loading and searching through files is limited to using Node built-ins (primarily the `fs` module). The main idea for searching throught the file is contained in [utils/readLastNLine.ts](./backend/src/utils/readLastNLine.ts). Here you will find a simple utility function that uses a ReadStream for efficient reading of lines through the file (as opposed to loading an entire file into memory before processing). I iterated on a few ideas here for optimization, and was able to achieve ~5X improvement from a few small changes. Details are [in the file](./backend/src/utils/readLastNLine.ts#L26-L51).

This performs well enough for smaller files I tested with, but does start to see a performance degradation as file size increases (I tested with up to ~6GB file). This makes sense, as this approach still needs to read sequentially through a file and that will gradually slow down as files get larger and larger.

Without digging too deep, I think the next meaningful performance increase might be achieved by utilizing some combination of the approach above plus a local data store. Another thought was if we imposed some constraints on how much new/recent data we want to retrieve, there could be a way to read from the file using an offset and keeping track of positions in a local state cache. Ultimately, some form of caching/DB scheme is where I could see some performance improvements.

## Usage

**NOTE: Start the backend app first. It runs on port 3000 and the frontend is configured to send traffic to that port via the [proxy setting in package.json](https://github.com/jbeveland27/log-collection-api/blob/main/frontend/package.json#L32).**

### Development

```bash
git clone https://github.com/jbeveland27/log-collection-api.git
cd log-collection-api

# install dependencies
cd backend && npm install ; cd ../frontend && npm install;

# Copy .env.sample to .env.development.local and change any needed vars if desired
cp .env.sample .env.development.local

# run backend and frontend together
# NOTE: Start the backend first. It runs on port 3000 and the frontend is
# configured to send traffic to that port via the proxy setting in package.json

# Open 2 terminal windows / editors and run:
# backend
npm run dev

# frontend - you'll be prompted to run on a different port, hit "y" to accept
npm start
```

### Postman

I tested the API with Postman locally, and included a Collection of these requests so they can be imported for others to use. This Collection is available in the [postman](./postman/) directory.

**Note**: The API is hard-coded to look in `/var/log` for files. Modify your local `.env` if you have files stored elsewhere you want to use with the API. Also, you will need to modify the `:logName` path param in the requests to match files that are on your local filesystem.

## Limitations

* Currently only return between 1 and 2000 lines as a design choice. As an improvement, it'd be nice to extend the route parameter options to allow pagination with cursors. This would enable more interesting usage in exploring Logs via API.
* As mentioned above, searching through files begins to slow down as files get substantially larger.

## Known Issues

* The UI opens to display a view of the directory tree. However, it needs to be filtered better (remove empty directories) and handle the click events more appropriately. Currently, if you have additional folders in your directory tree you're not able to browse and select a nested file. I think these issues are mostly due to my unfamiliarity with the TreeView component from MUI.
* Add URL encoding to path/query parameters in the UI app when making API calls

## Finishing touches I haven't gotten around to yet, but might within the next few days

* Testing
* Production Build script / Dockerfile
* Swagger/OpenAPI Documentation for the API
* Bits of cleanup here and there
