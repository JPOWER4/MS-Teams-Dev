import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/configuratabTab/index.html")
@PreventIframe("/configuratabTab/config.html")
@PreventIframe("/configuratabTab/remove.html")
export class ConfiguratabTab {
}
