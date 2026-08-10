import { apiFetch } from './client';

export type TourLanguage = 'kor' | 'eng' | 'jpn' | 'chs' | 'cht';
export type TourCategory =
  | 'all'
  | 'heritage'
  | 'museum'
  | 'art_gallery'
  | 'library'
  | 'cultural_facility'
  | 'festival'
  | 'course'
  | 'leisure'
  | 'stay'
  | 'market'
  | 'food'
  | 'nature'
  | 'exchange';

export type TourSpot = {
  contentId: string;
  title: string;
  address: string;
  imageUrl: string | null;
  imageUrl2: string | null;
  latitude: number | null;
  longitude: number | null;
  overview: string;
  contentTypeId: string;
  category: TourCategory;
  eventStartDate?: string;
  eventEndDate?: string;
  pronunciation: string;
  homepage: string;
  imageSource?: string | null;
  imageSourceUrl?: string | null;
  imageAuthor?: string | null;
  imageLicense?: string | null;
  imageLicenseUrl?: string | null;
  imageAttributionRequired?: boolean | null;
  sourceUrl?: string | null;
  enrichmentSource?: string | null;
};

export type TourSpotsResponse = {
  success: boolean;
  data: {
    items: TourSpot[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
  message: string | null;
};

export type TourSpotDetail = TourSpot & {
  addressDetail: string;
  images: Array<{
    url: string;
    thumbnailUrl: string;
  }>;
  telephone: string;
  openHours: string;
  restDate: string;
  parking: string;
  usageFee: string;
  duration: string;
};

export type TourSpotDetailResponse = {
  success: boolean;
  data: TourSpotDetail;
  message: string | null;
};

export type GetTourSpotsParams = {
  language?: TourLanguage;
  page?: number;
  pageSize?: number;
  category?: TourCategory;
  keyword?: string;
};

export function getTourSpots(params: GetTourSpotsParams = {}) {
  const query = new URLSearchParams();
  query.set('language', params.language || 'kor');
  query.set('page', String(params.page || 1));
  query.set('pageSize', String(params.pageSize || 20));
  query.set('category', params.category || 'all');
  if (params.keyword?.trim()) query.set('keyword', params.keyword.trim());
  return apiFetch<TourSpotsResponse>(`/tour/spots?${query.toString()}`);
}

export function getTourSpotDetail(contentId: string, language: TourLanguage = 'kor') {
  const query = new URLSearchParams({ language });
  return apiFetch<TourSpotDetailResponse>(`/tour/spots/${encodeURIComponent(contentId)}?${query.toString()}`);
}
