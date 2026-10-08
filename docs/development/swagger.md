# Swagger UI

The live Swagger page for the Wits Quest API, shown right here. Open any endpoint, click **Try it out**, then **Execute** to send a real request to the live API and see the response.

To call endpoints that need a login, run `POST /auth/token` with an email and password, copy `access_token` from the response, then click **Authorize** and paste it in.

!!! note "Page blank or slow?"
    The API runs on Render's free plan and sleeps when idle, so the page can take up to a minute to appear the first time. If it stays blank, [open the Swagger UI in a new tab](https://wits-quest.onrender.com/api/docs){ target="_blank" }.

<iframe src="https://wits-quest.onrender.com/api/docs" title="Wits Quest API Swagger UI" loading="lazy" style="width: 100%; height: 1400px; border: 1px solid var(--md-default-fg-color--lightest); border-radius: 6px; background: #fff;"></iframe>

For every endpoint in one list, with notes on which ones aren't on the Swagger page yet, see the [Endpoint Catalogue](api-endpoints.md).
