export interface Option {
    text: string;
    eliminated: boolean;
    result: boolean;
}

export interface Category {
    id: string;
    name: string;
    options: Option[];
}

export interface FlattenedOption {
    catIdx: number;
    optIdx: number;
}
