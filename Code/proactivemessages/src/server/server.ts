import * as Express from "express";
import * as http from "http";
import * as path from "path";
import * as morgan from "morgan";
import { MsTeamsApiRouter, MsTeamsPageRouter } from "express-msteams-host";
import * as debug from "debug";
import * as compression from "compression";

// Initialize debug logging module
const log = debug("msteams");

log("Initializing Microsoft Teams Express hosted App...");

// Initialize dotenv, to use .env file settings if existing
require("dotenv").config();


// The import of components has to be done AFTER the dotenv config
// eslint-disable-next-line import/first
import * as allComponents from "./TeamsAppsComponents";
import { BotFrameworkAdapter, MessageFactory, CardFactory, ConversationParameters, Activity, Attachment, MemoryStorage, UserState } from "botbuilder";
import { AttachmentAction, SwitchCameraIcon } from "@fluentui/react-northstar";

// Create the Express webserver
const express = Express();
const port = process.env.port || process.env.PORT || 3007;

// Inject the raw request body onto the request object
express.use(Express.json({
    verify: (req, res, buf: Buffer, encoding: string): void => {
        (req as any).rawBody = buf.toString();
    }
}));
express.use(Express.urlencoded({ extended: true }));

// Express configuration
express.set("views", path.join(__dirname, "/"));

// Add simple logging
express.use(morgan("tiny"));

// Add compression - uncomment to remove compression
express.use(compression());

// Add /scripts and /assets as static folders
express.use("/scripts", Express.static(path.join(__dirname, "web/scripts")));
express.use("/assets", Express.static(path.join(__dirname, "web/assets")));

// routing for bots, connectors and incoming web hooks - based on the decorators
// For more information see: https://www.npmjs.com/package/express-msteams-host
express.use(MsTeamsApiRouter(allComponents));

// routing for pages for tabs and connector configuration
// For more information see: https://www.npmjs.com/package/express-msteams-host
express.use(MsTeamsPageRouter({
    root: path.join(__dirname, "web/"),
    components: allComponents
}));

// Set default web page
express.use("/", Express.static(path.join(__dirname, "web/"), {
    index: "index.html"
}));

// Set the port
express.set("port", port);

// Start the webserver
http.createServer(express).listen(port, () => {
    log(`Server running on ${port}`);
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// tslint:disable-next-line:no-var-requires
const BotConnector = require("botframework-connector");
const credentials = new BotConnector.MicrosoftAppCredentials(
    process.env.MICROSOFT_APP_ID,
    process.env.MICROSOFT_APP_PASSWORD
);

BotConnector.MicrosoftAppCredentials.trustServiceUrl(
    process.env.SERVICE_URL
);

express.post("/api/proactive", async (req, res, next) => {
    /*let adaptiveCard;
    const message = MessageFactory.attachment(adaptiveCard) as Activity;
    message.summary = "Urgent Notification";
    message.text = "";*/
    const message = MessageFactory.text("Hello proactive message") as Activity;

    const conversationParameters = {
        isGroup: false,
        channelData: {
            tenant: {
                id: "a24c5ca5-fe5c-4b0b-a903-6d683d1c8239"
            }
        },
        bot: {
            id: process.env.BOT_ID,
            name: process.env.BOT_NAME
        },
        members: [
            {
                id: "29:1jkY70G3vUshjIRYDJ1gtjE2KHF7_d22wNivLYGn5YZjF1Ffns8bhmSZBllW06YQs6PN8K3soOaWf7zXIEMOKmA",
                name: "ProActiveMessage"
            }
        ]
    };

    const parametersTalk = conversationParameters as ConversationParameters;
    const connectorClient = adapter.createConnectorClient(process.env.SERVICE_URL as string);
    const response = await connectorClient.conversations.createConversation(parametersTalk);
    await connectorClient.conversations.sendToConversation(response.id, message);
    res.send(`Message sent`);

    next();
});