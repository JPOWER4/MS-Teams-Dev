import * as React from "react";
import { Provider, Flex, Text, Button, Header } from "@fluentui/react-northstar";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import { app } from "@microsoft/teams-js";
import * as microsoftTeams from "@microsoft/teams-js";
import { TextField, ITextFieldStyles } from "@fluentui/react";
import { UserState } from "botbuilder";

/**
 * Implementation of the taskTab content page
 */
export const TaskTab = () => {

    const [{ inTeams, theme, context }] = useTeams();
    const [entityId, setEntityId] = useState<string | undefined>();
    const [youTubeVideoId, setyouTubeVideoId] = useState("z6IUiamE3-U");
    const [testval, settestval] = useState("testing");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [designation, setDesignation] = useState("");

    const onShowVideo = (event: React.MouseEvent<HTMLButtonElement>): void => {
        // settestval(process.env.PUBLIC_HOSTNAME + `/taskmodule/player.html?vid=${youTubeVideoId}`);
        const taskModuleInfo = {
            title: "YouTube Player",
            url: "https://" + process.env.PUBLIC_HOSTNAME + `/taskmodule/player.html?vid=${youTubeVideoId}`,
            width: 1000,
            height: 700
        };
        microsoftTeams.tasks.startTask(taskModuleInfo);
    }

    const ongetEmployeeInfo = (event: React.MouseEvent<HTMLButtonElement>): void => {
        const taskformmoduleInfo = {
            url: "https://" + process.env.PUBLIC_HOSTNAME + `/taskmodule/getInfo.html`,
            title: "Custom Form",
            height: 300,
            width: 400
        };
    

        const submitHandler = (err, result) => {
            setName(`Name : ${result.name}`);
            setEmail(`Email : ${result.email}`);
            setDesignation(`Designation : ${result.designation}`);
        };
        microsoftTeams.tasks.startTask(taskformmoduleInfo, submitHandler); 
    }

    const ongetAdaptiveCard = (event: React.MouseEvent<HTMLButtonElement>): void => {
        const ACcard:any = require("./customform.json");
        const taskmoduleinfoAC = {
            title:"Custom form Adaptive card",
            card:ACcard,
            width:500,
            height:500
        };

        const submitHandler = (err, result) => {
            setName(`Name : ${result.name}`);
            setEmail(`Email : ${result.email}`);
            setDesignation(`Designation : ${result.designation}`);
        };
        microsoftTeams.tasks.startTask(taskmoduleinfoAC, submitHandler); 
    }

    useEffect(() => {
        if (inTeams === true) {
            app.notifySuccess();
        } else {
            setEntityId("Not in Microsoft Teams");
        }
    }, [inTeams]);

    useEffect(() => {
        if (context) {
            setEntityId(context.page.id);
        }
    }, [context]);

    /**
     * The render() method to create the UI of the tab
     */
    return (
        <Provider theme={theme}>
            <Flex column gap="gap.smaller">
                <Header>Task Module Demo</Header>
                <input type="text"  placeholder="Enter your youtube Video ID" onChange={e => setyouTubeVideoId(e.target.value)}  />
                <Button content="Show Video" primary onClick={onShowVideo}></Button>
                <Button content="Get Information" primary onClick={ongetEmployeeInfo}></Button>
                <Button content="Get Information - Adaptive Card" primary onClick={ongetAdaptiveCard}></Button>

                <Text>{name}</Text>
                <Text>{email}</Text>
                <Text>{designation}</Text>
            </Flex>
        </Provider>
    );


};
