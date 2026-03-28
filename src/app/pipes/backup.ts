res.replaceAll('<script>', 'script').replaceAll('</script>', '/script');
res = res.replaceAll(/\n/g, '<br>');
let stringArr = res.split('color=');
for (let s of stringArr) {
  if (!s.startsWith('#')) continue;
  let hex = s.slice(0, 7);
  res = res
    .replace(`<color=${hex}>`, `<span style="color:${hex}">`)
    .replace('</color>', '</span>');
}
res = res
  .replaceAll('<align=center>', `<div class="text-center">`)
  .replaceAll('</align>', '</div>');
res = res
  .replaceAll('<size=1>', `</span><span class="text-sm">`)
  .replaceAll('<size=2>', `</span><span class="text-base">`)
  .replaceAll('<size=3>', `</span><span class="text-lg">`)
  .replaceAll('<size=4>', `</span><span class="text-xl">`)
  .replaceAll('<size=5>', `</span><span class="text-2xl">`)
  .replaceAll('<size=6>', `</span><span class="text-3xl">`)
  .replace('</span>', '');
res = res + '</span>';
console.log(res);
return res;
