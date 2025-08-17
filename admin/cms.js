// Bouton "YouTube" dans l’éditeur Netlify CMS
// Accepte un ID OU une URL YouTube, et insère l'include Liquid.
function youtubeIdFrom(input) {
  if (!input) return "";
  try {
    // URL complète ?
    const u = new URL(input);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
  } catch (e) {
    // pas une URL -> peut déjà être un ID
  }
  return input.trim();
}

CMS.registerEditorComponent({
  id: "youtube",
  label: "YouTube",
  fields: [{ name: "input", label: "URL ou ID YouTube" }],
  // Quand on voit l’include dans le markdown, on le reconnait
  pattern: /\{\%\s*include\s+yt\.html\s+id=([^\s\%]+)\s*\%\}/,
  fromBlock: match => ({ input: match[1].replace(/^page\.youtube_id$/, "") }),
  toBlock: obj => `{% include yt.html id=${youtubeIdFrom(obj.input)} %}`,
  toPreview: obj =>
    `<img src="https://img.youtube.com/vi/${youtubeIdFrom(obj.input)}/hqdefault.jpg" style="max-width:100%;height:auto;border:0;">`,
});
