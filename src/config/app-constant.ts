//QUERY CONSTANTS
const QUERY_STALE_TIME = 60 * 1000


//PAGINATION CONSTANTS
const DEFAULT_PAGE_SIZE = 10
const DEFAULT_PAGE = 1


export {
    QUERY_STALE_TIME,
    DEFAULT_PAGE_SIZE,
    DEFAULT_PAGE
}

export interface PageParams {
    page?: number;
    per_page?: number;
    search?: string;
    [key: string]: string | number | boolean | undefined; 
}

export interface GetParams {
  page?: number;
  per_page?: number;
  [key: string]: any; 
}

export const currency = "NPR"

export const TEXT_COLORS = [
    "#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", 
    "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc",
    "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb",
    "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0",
    "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200",
    "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000"
]

export const HIGHLIGHT_COLORS = [
    "#fff3cd", "#d1ecf1", "#d4edda", "#f8d7da", "#e2e3e5",
    "#ffeaa7", "#74b9ff", "#55efc4", "#fd79a8", "#a29bfe"
]