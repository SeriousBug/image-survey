import axios from "axios";
import cookie from "js-cookie";
import ErrorMsg from "./ErrorMsg";


const COOKIE_NAME = 'image-survey'


function __set_auth_token(token) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}

// Reload a saved token, or acquire a new one if needed
async function init_token() {
    const token = cookie.get(COOKIE_NAME);
    console.log('Current token ' + token);
    if (token === undefined) {
        try {
            const response = await axios.post('/auth', {});
            const token = response.data['access_token'];
            cookie.set(COOKIE_NAME, token);
            __set_auth_token(token);
        } catch (err) {
            console.log('Got error!' + err.toString());
            ErrorMsg.showError(err.toJSON());
        }
    } else {
        __set_auth_token(token);
    }
}


export async function init() {
    axios.defaults.baseURL = 'http://localhost:8000';
    await init_token();
}


export async function get_images() {
    try {
        const response = await axios.get('/api/vote_sets');
        return response.data;
    } catch (err) {
        ErrorMsg.showError(err.toJSON());
    }
}