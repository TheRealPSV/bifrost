import express from "express";
import axios from "axios";

const PORT = process.env.PORT || 3001;
const BASE_DOMAIN = process.env.BASE_DOMAIN || "";
const NGINXPM_URL = process.env.NGINXPM_URL.endsWith("/") ? process.env.NGINXPM_URL : process.env.NGINXPM_URL + "/" || "";
const NGINXPM_USER = process.env.NGINXPM_USER || "";
const NGINXPM_PASS = process.env.NGINXPM_PASS || "";

const app = express();

app.use(express.static('public'));

app.get("/fetchHosts", async (req, res) => {
    try {
        const nameRegex = /^\s*#\s*<name>\s*:\s*<(.+)>\s*$/im;
        const subpathRegex = /^\s*#\s*<subpath>\s*:\s*<\/*(.+)>\s*$/im;
        const hideRegex = /^\s*#\s*<hide>\s*:\s*<\/*(.+)>\s*$/im;

        const tokenData = await axios.post(`${NGINXPM_URL}api/tokens`, {
            "identity": NGINXPM_USER,
            "secret": NGINXPM_PASS
        });
        const token = tokenData.data.token;
        const hostsData = await axios.get(`${NGINXPM_URL}api/nginx/proxy-hosts`, {
            "headers": {
                "Authorization": `Bearer ${token}`
            }
        });
        const hosts = hostsData.data;
        const hostInfo = hosts
            .filter(d => d.meta.nginx_online === true) //hide anything offline
            .map(d => {
                const domain = d.domain_names?.[0] ?? "";
                const hide = (d.advanced_config.match(hideRegex)?.[1] ?? "").toLowerCase() === "true";
                const subpath = d.advanced_config.match(subpathRegex)?.[1] ?? "";
                const url = `https://${domain}/${subpath}`;
                const name = d.advanced_config.match(nameRegex)?.[1] ?? domain.replace("." + BASE_DOMAIN, "");
                return {
                    name,
                    url,
                    hide
                }
            })
            .filter(d => d.hide !== true) //hide anything meant to be hidden;
        res.json(hostInfo);
    } catch (e) {
        console.error(e);
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
