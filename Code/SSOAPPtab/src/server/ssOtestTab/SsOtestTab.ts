import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/ssOtestTab/index.html")
@PreventIframe("/ssOtestTab/config.html")
@PreventIframe("/ssOtestTab/remove.html")
export class SsOtestTab {
}
