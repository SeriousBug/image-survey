import axios from "axios";
import cookie from "js-cookie";
import ErrorMsg from "./ErrorMsg";

const COOKIE_NAME = "auth";

function __set_auth_token(token: string) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
}

function set_auth_token(token: string) {
  __set_auth_token(token);
  cookie.set(COOKIE_NAME, token);
}

export let images = [];
export let last_current = -1;

function handle_network_errors(err: any) {
  if (err.response) {
    // Request was made, and response was received
    console.log("Network error!");
    console.log(err.response.data);
    console.log(err.response.status);
    console.log(err.response.headers);
    if (err.response.status === 401) {
      // Auth error
      cookie.remove(COOKIE_NAME);
      console.log("Auth error, deleting existing auth cookie to resolve");
    }
  } else if (err.request) {
    // Request was made, but no response received
    console.log(err.request);
  } else {
    // Couldn't even make the request
    console.log(err.message);
  }
  console.log(err.config);
  ErrorMsg.showError(JSON.stringify([err, err.request, err.response]));
}

// Reload a saved token, or acquire a new one if needed
async function init_token() {
  const token = cookie.get(COOKIE_NAME);
  console.log("Current token " + token);
  if (token === undefined) {
    try {
      const response = await axios.post("/api/auth", {});
      const token = response.data["access_token"];
      set_auth_token(token);
    } catch (err) {
      handle_network_errors(err);
    }
  } else __set_auth_token(token);
}

export async function init() {
  axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
  await init_token();
}

export async function login(username: string, password: string) {
  try {
    const response = await axios.post("/api/auth", { username, password });
    const token = response.data["access_token"];
    set_auth_token(token);
    return true;
  } catch {
    // TODO: Better error handling so that failed network connections are handled differently than a bad password
    return false;
  }
}

export async function get_images() {
  try {
    const response = await axios.get("/api/vote_sets");
    console.log(JSON.stringify(response.data));
    images = response.data["votesets"];
    last_current = response.data["current"];
  } catch (err) {
    handle_network_errors(err);
  }
}

export async function vote_image(data: any) {
  try {
    await axios.post("/api/rate", data);
  } catch (err) {
    handle_network_errors(err);
  }
}
