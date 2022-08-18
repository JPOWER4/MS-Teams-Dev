import * as debug from "debug";
import { PreventIframe } from "express-msteams-host";
import { TurnContext, CardFactory, MessagingExtensionQuery, MessagingExtensionResult, TaskModuleRequest, TaskModuleContinueResponse } from "botbuilder";
import { IMessagingExtensionMiddlewareProcessor } from "botbuilder-teams-messagingextensions";

// Initialize debug logging module
const log = debug("msteams");

@PreventIframe("/getBGetBooksMessageExtension/config.html")
@PreventIframe("/getBGetBooksMessageExtension/action.html")
export default class GetBGetBooksMessageExtension implements IMessagingExtensionMiddlewareProcessor {

    public async onFetchTask(context: TurnContext, value: MessagingExtensionQuery): Promise<MessagingExtensionResult | TaskModuleContinueResponse> {

        return Promise.resolve<TaskModuleContinueResponse>({
            type: "continue",
            value: {
                title: "ISBN Number Selector",
                card: CardFactory.adaptiveCard({
                    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                    type: "AdaptiveCard",
                    version: "1.0",
                    body: [
                        {
                            type: "TextBlock",
                            text: "Please enter an ISBN Number"
                        },
                        {
                            type: "Input.Text",
                            id: "isbn",
                            placeholder: "ISBN Number ISBN: 9780789748591",
                            style: "email"
                        },
                    ],
                    actions: [
                        {
                            type: "Action.Submit",
                            title: "OK",
                            data: { id: "unique-id" }
                        }
                    ]
                })
            }
        });
    }

    // handle action response in here
    // See documentation for `MessagingExtensionResult` for details
    public async onSubmitAction(context: TurnContext, value: TaskModuleRequest): Promise<MessagingExtensionResult> {

        const request = require("request");
        const isbnnumber = value.data.isbn;
        const url = "https://www.googleapis.com/books/v1/volumes?q=" + isbnnumber + "&limit=1&offset=0";
        let title: string = "";
        let description: string = "";
        let publisher: string = "";
        let imageurl: string = "";
        let messagingExtensionResult;
        return new Promise<MessagingExtensionResult>((resolve,
            reject) => {
            request(url, { json: true }, (err, res, body) => {
                if (err) {
                    return;
                }
                const data = body;
                if (data.items) {
                    const item = data.items[0];
                    title = item.volumeInfo.title;
                    description = item.volumeInfo.description;
                    publisher = item.volumeInfo.publisher;
                    imageurl = item.volumeInfo.imageLinks.thumbnail;
                }
                const card = CardFactory.adaptiveCard(
                    {
                        type: "AdaptiveCard",
                        body: [
                            {
                                type: "Image",
                                url: imageurl
                            },
                            {
                                type: "TextBlock",
                                size: "Large",
                                text: "Title: " + title
                            },
                            {
                                type: "TextBlock",
                                size: "Medium",
                                text: description
                            },
                            {
                                type: "TextBlock",
                                size: "Medium",
                                text: "Publisher: " + publisher
                            },
                            {
                                type: "TextBlock",
                                size: "Medium",
                                text: "ISBN Number: " + isbnnumber
                            }
                        ],
                        $schema: "http://adaptivecards.io/schemas/adaptive- card.json",
                        version: "1.0"
                    });
                messagingExtensionResult = {
                    type: "result",
                    attachmentLayout: "list",
                    attachments: [card]
                };
                resolve(messagingExtensionResult);
            });
        });
    }
}
