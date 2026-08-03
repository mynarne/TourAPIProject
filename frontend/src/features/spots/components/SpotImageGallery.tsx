type SpotImageGalleryProps = {
  title: string;
  images: Array<{ url: string; thumbnailUrl: string }>;
};

export function SpotImageGallery({ title, images }: SpotImageGalleryProps) {
  if (!images.length) {
    return <div className="flex h-72 items-center justify-center rounded-3xl bg-blue-50 text-suwon">등록된 이미지가 없습니다.</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {images.map((image) => (
        <img
          key={image.url}
          className="h-72 w-full rounded-3xl object-cover"
          src={image.url}
          alt={title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ))}
    </div>
  );
}
