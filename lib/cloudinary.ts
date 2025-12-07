export function cld(url: string, width: number, height: number) {
  if (!url) return url;
  return url.replace(
    "/upload/",
    `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`
  );
}
