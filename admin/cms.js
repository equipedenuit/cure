function youtubeIdFrom(input) {
  if (!input) return "";
  try {
    const u = new URL(input);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
  } catch {}
  return String(input).trim();
}

CMS.registerEditorComponent({
  id: "youtube",
  label: "YouTube",
  fields: [{ name: "input", label: "URL ou ID YouTube" }],

  // Reconnaît id="XXXXX" ou id='XXXXX' ou (à l’ancienne) id=XXXXX
  pattern: /\{\%\s*include\s+yt\.html\s+id=(?:"|')?([^"'%\s]+)(?:"|')?\s*\%\}/,

  fromBlock: (match) => ({ input: match[1] }),
  toBlock:   (obj)   => `{% include yt.html id="${youtubeIdFrom(obj.input)}" %}`,
  toPreview: (obj)   =>
    `<img src="https://img.youtube.com/vi/${youtubeIdFrom(obj.input)}/hqdefault.jpg" style="max-width:100%;height:auto;border:0;">`,
});
