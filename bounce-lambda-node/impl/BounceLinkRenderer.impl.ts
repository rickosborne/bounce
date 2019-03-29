import {BounceLink} from "../api/BounceLink";
import {BounceLinkRenderer} from "../api/BounceLinkRenderer";
import {htmlEncode, jsEscapeString} from "./HTML";

@BounceLinkRenderer.implementation
class BounceLinkRendererImpl implements BounceLinkRenderer {
  public asHTML(link: BounceLink, lang: string = "en-us"): string {
    return `
<html lang="${htmlEncode(lang)}">
<head>
<meta charset="UTF-8">
<title>${htmlEncode(link.title)}</title>
<script>window.location.href = '${htmlEncode(jsEscapeString(link.href))}';</script>
</head>
<body>
<a href="${htmlEncode(link.href)}">${htmlEncode(link.title)}</a>
</body>
</html>
      `.replace(/^\s*|\s*$/g, '');
  }
}
