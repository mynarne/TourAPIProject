type SpotImageGalleryProps = {
  title: string;
  images: Array<{ url: string; thumbnailUrl: string }>;
};

export function SpotImageGallery({ title, images }: SpotImageGalleryProps) {
  if (!images.length) {
    return (
      <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-3xl bg-blue-50 text-suwon">
        <img className="h-full w-full object-cover opacity-80" src="/icons/linksuwon-default.png" alt="" />
        <span className="absolute rounded-full bg-white/90 px-4 py-2 text-sm font-semibold shadow-sm">등록된 이미지가 없습니다.</span>
      </div>
    );
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
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/icons/linksuwon-default.png';
          }}
        />
      ))}
    </div>
  );
}
