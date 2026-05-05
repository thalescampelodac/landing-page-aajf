export const publicationCoverBucketName = "publication-cover-images";
export const publicationCoverAcceptedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const publicationCoverMaxFileSizeInBytes = 5 * 1024 * 1024;
export const publicationCoverMinimumWidth = 1600;
export const publicationCoverMinimumHeight = 1000;
export const publicationCoverRecommendedRatio = "16:10";

