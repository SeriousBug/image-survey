import axios from "axios";
import cookie from "js-cookie";
import showError from "./ErrorMsg";


const COOKIE_NAME = 'image-survey'
let image_sets = [];


function __set_auth_token(token) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}
// Reload a saved token, or acquire a new one if needed
async function init_token() {
    const token = cookie.get(COOKIE_NAME);
    if (token === undefined) {
        try {
            const response = await axios.post('/auth', {});
            console.log(response);
            const token = response.data['access_token'];
            cookie.set(COOKIE_NAME, token);
            __set_auth_token(token);
        } catch (err) {
            showError(err.toJSON());
        }
    }
    __set_auth_token(token);
}


async function init() {
    axios.defaults.baseURL = 'http://localhost:8000';
    await init_token();
}


async function get_images() {
    try {
        const response = await axios.get('/')
    } catch (err) {

    }
}


export default init;