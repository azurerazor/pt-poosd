const API_URL = 'http://localhost:5050'; // FIXME: Change to remote
const API_URL_DEV = 'http://localhost:5050';

export function getAPIRoute(path: string): string {
    const base = (process.env.NODE_ENV == 'development') ? API_URL_DEV : API_URL;
    return `${base}/api/${path}`;
}
