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

export const currency = "NPR"