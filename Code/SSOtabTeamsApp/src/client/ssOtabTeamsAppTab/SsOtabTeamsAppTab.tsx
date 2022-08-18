import * as React from "react";
import { Provider, Flex, Text, Button, Header } from "@fluentui/react-northstar";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import { app, authentication } from "@microsoft/teams-js";
import jwtDecode from "jwt-decode";

/**
 * Implementation of the SSOtabTeamsApp content page
 */
export const SsOtabTeamsAppTab = () => {

    const [{ inTeams, theme, context }] = useTeams();
    const [entityId, setEntityId] = useState<string | undefined>();
    const [name, setName] = useState<string>();
    const [error, setError] = useState<string>();

    useEffect(() => {
        if (inTeams === true) {
            authentication.getAuthToken({
                resources: ["api://4950-183-82-206-221.ngrok.io/25daa389-81b9-4ae4-87e4-9c18a0517f33"],
                silent: false
            } as authentication.AuthTokenRequestParameters).then(token => {
                const decoded: { [key: string]: any; } = jwtDecode(token) as { [key: string]: any; };
                setName(decoded!.name);
                app.notifySuccess();
            }).catch(message => {
                setError(message);
                app.notifyFailure({
                    reason: app.FailedReason.AuthFailed,
                    message
                });
            });
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
            <Flex fill={true} column styles={{
                padding: ".8rem 0 .8rem .5rem"
            }}>
                <Flex.Item>
                    <Header content="This is your tab" />
                </Flex.Item>
                <Flex.Item>
                    <div>
                        <div>
                            <Text content={`Hello ${name}`} />
                        </div>
                        {error && <div><Text content={`An SSO error occurred ${error}`} /></div>}

                        <div>
                            <Button onClick={() => alert("It worked!")}>A sample button</Button>
                        </div>
                    </div>
                </Flex.Item>
                <Flex.Item styles={{
                    padding: ".8rem 0 .8rem .5rem"
                }}>
                    <Text size="smaller" content="(C) Copyright Jenkins NS" />
                </Flex.Item>
            </Flex>
        </Provider>
    );
};
