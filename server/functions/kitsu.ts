export async function getKitsuMediaDetails(id) {
    const mediaData = await fetch(`https://kitsu.io/api/edge/anime/${id}`)

    if (mediaData.ok != true) { return null; }

    const mediaDataObject: KitsuResponse = await mediaData.json()

    return {
        title: mediaDataObject.data.attributes.titles.en || mediaDataObject.data.attributes.titles.en_jp || mediaDataObject.data.attributes.titles.ja_jp,
    }
}

export interface KitsuResponse {
    data: Data;
}

export interface Data {
    id:            string;
    type:          string;
    links:         DataLinks;
    attributes:    Attributes;
    relationships: { [key: string]: Relationship };
}

export interface Attributes {
    createdAt:           Date;
    updatedAt:           Date;
    slug:                string;
    synopsis:            string;
    description:         string;
    coverImageTopOffset: number;
    titles:              Titles;
    canonicalTitle:      string;
    abbreviatedTitles:   string[];
    averageRating:       string;
    ratingFrequencies:   { [key: string]: string };
    userCount:           number;
    favoritesCount:      number;
    startDate:           Date;
    endDate:             null;
    nextRelease:         Date;
    popularityRank:      number;
    ratingRank:          number;
    ageRating:           string;
    ageRatingGuide:      string;
    subtype:             string;
    status:              string;
    tba:                 null;
    posterImage:         PosterImage;
    coverImage:          CoverImage;
    episodeCount:        null;
    episodeLength:       number;
    totalLength:         number;
    youtubeVideoId:      string;
    showType:            string;
    nsfw:                boolean;
}

export interface CoverImage {
    tiny:     string;
    large:    string;
    small:    string;
    original: string;
    meta:     Meta;
}

export interface Meta {
    dimensions: Dimensions;
}

export interface Dimensions {
    tiny:    Large;
    large:   Large;
    small:   Large;
    medium?: Large;
}

export interface Large {
    width:  number;
    height: number;
}

export interface PosterImage {
    tiny:     string;
    large:    string;
    small:    string;
    medium:   string;
    original: string;
    meta:     Meta;
}

export interface Titles {
    en:    string;
    en_jp: string;
    ja_jp: string;
}

export interface DataLinks {
    self: string;
}

export interface Relationship {
    links: RelationshipLinks;
}

export interface RelationshipLinks {
    self:    string;
    related: string;
}