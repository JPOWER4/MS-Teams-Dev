import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/infyTestAppTab/index.html")
@PreventIframe("/infyTestAppTab/config.html")
@PreventIframe("/infyTestAppTab/remove.html")
export class InfyTestAppTab {
}
