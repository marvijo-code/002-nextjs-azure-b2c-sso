'use client'

import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { authScopes } from "../authConfig";
import { useEffect, useState } from "react";

export default function App() {
    const { instance, accounts } = useMsal();
    const [accountDetails, setAccountDetails] = useState(null);

    if (accounts.length > 0) {
        console.log('accounts', accounts)
    }

    function handleLogin() {
        console.log('accounts', instance)
        instance.loginPopup(authScopes).then(response => {
            console.log("login successful!", response);

            instance.setActiveAccount(response.account);

            setAccountDetails({
                name: response.idTokenClaims.name,
                accessToken: response.idTokenClaims.idp_access_token
            });
        }).catch(e => {
            console.log(e);
        });
    }

    if (accountDetails && (accountDetails.accessToken && !accountDetails.googlePropic)) {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${accountDetails.accessToken}`);

        const userInfoRequest = {
            method: 'GET',
            headers: headers
        };

        fetch('https://www.googleapis.com/oauth2/v1/userinfo', userInfoRequest)
            .then(r => r.json())
            .then(resp => {
                console.log('userinfo response', resp);

                setAccountDetails({ ...accountDetails, googlePropic: resp.picture });
            });
    }

    function handleLogout() {
        instance.logoutPopup(authScopes).then(response => {

        }).catch(e => {
            console.log(e);
        });
    }

    return (
        <center>
            <h1>Please&nbsp;
                <a target="_blank" href="https://www.youtube.com/@marvijosoftware?view_as=subscriber&sub_confirmation=1">
                    SUBSCRIBE!
                </a>
            </h1>
            <AuthenticatedTemplate>
                <h6>You're logged in!</h6>

                {accountDetails && (
                    <center>
                        <img src={accountDetails.googlePropic} />
                        <br />
                        Name: {accountDetails.name}
                    </center>
                )}
                <button onClick={() => handleLogout()}>Logout</button >
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <p>Please log in</p>

                <button onClick={() => handleLogin()}>Login</button >
            </UnauthenticatedTemplate>
        </center>
    );
}