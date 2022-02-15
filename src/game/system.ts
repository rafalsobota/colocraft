export function slowMobileBrowser() {
  var ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);// || ua.match('CriOS');
}