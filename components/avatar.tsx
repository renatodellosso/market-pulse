export default function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="avatar p-1">
      <div className="w-12 h-12 rounded-full">
        <img src={src} alt={alt} className="" />
      </div>
    </div>
  );
}
