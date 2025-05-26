# B I F R O S T

*A noble warrior's bridge to the world.*

Bifrost is a lightweight, automated Docker-based alternative to the Heimdall dashboard for users of [Nginx Proxy Manager](https://github.com/NginxProxyManager/nginx-proxy-manager), with extensive customization.

Unlike Heimdall, which requires manual setup for each service, Bifrost *automatically* fetches your individual Proxy Hosts in Nginx Proxy Manager, and displays them as links on a customizable dashboard.

Bifrost includes a configurable combination URL and search bar as well. If you type a URL it'll take you there, and if you type anything else, it'll search with your favorite search engine.

Also unlike Heimdall, virtually every aspect of Bifrost can be customized to your liking, from colors and fonts to the structure of the page.

Bifrost makes a great home page too, no more creating manual bookmarks everywhere each time you add a service to your reverse proxy.

<img src="https://github.com/user-attachments/assets/345f6b6b-3635-4794-8737-4dfffd5bac29" height="500" />      
<img src="https://github.com/user-attachments/assets/dabf6512-ea45-4b15-a834-dc72dd51b0cb" height="500" />

## Usage

### Setup

Setting up Bifrost is a little involved, but it's really as simple as setting up your service account in Nginx Proxy Manager, adding your custom configs to it, then setting up the Bifrost Docker image (and any customizations you'd like to make).

#### Nginx Proxy Manager

1. Before using Bifrost, make sure you have a working setup with [Nginx Proxy Manager](https://github.com/NginxProxyManager/nginx-proxy-manager), hosted behind your chosen domain. In this example, we'll use `example.com` as your base domain for all your services, with Nginx Proxy Manager hosted at `nginx-proxy-manager.example.com`.

2. As the Administrator user, create a new account to act as your [service account](https://en.wikipedia.org/wiki/Service_account). Your service account is the account that Bifrost will use to fetch data from Nginx Proxy Manager so it can be shown on the dashboard. Give it a strong password, and whatever name helps you remember its role.

3. Once you've added your new user, set up the permissions (Users -> Context Menu on the User -> Edit Permissions) so it ONLY has View Only access to Proxy Hosts. Everything else should be Hidden. However, you do need to set Item Visibility to All Items. This allows the account to fetch data for all Proxy Hosts (all your proxied services), without seeing anything else or modifying anything.

<img src="https://github.com/user-attachments/assets/26905e94-b223-4de7-8f00-0b5937809490" height="700" />

4. Configure your individual Proxy Hosts to show up in Bifrost the way you want them. By default, if you don't configure an individual host, Bifrost will still show it, but will just use the part of the domain before your base domain for the name. For example, a service hosted at `something.example.com`, where your base domain is `example.com`, will have the name read `something` on its button. Note that any offline host will be hidden by Bifrost.

#### Nginx Proxy Manager - Proxy Host Config

To customize the button for an individual host, in Nginx Proxy Manager, update the site's custom Nginx config (Edit the Proxy Host and go to the Advanced tab). In the box, add a specially formatted comment like below, and make sure to INCLUDE the <> around both the tag and the actual data.

To customize the name displayed on the button, add the following tag comment. Replace `Service Name` with whatever you want the button to show.

`#<name>:<Service Name>`

You can customize the subpath a button points to. For example, if you have a service hosted at `something.example.com`, but it requires you to go to `something.example.com/admin` to use it, you can set the subpath to `admin` so the button points directly to the right path. To customize the button's subpath, add the following tag comment, replacing `location` with the subpath value.

`#<subpath>:<location>`

You can also hide a particular host from Bifrost by adding the below comment to the custom config as below. Note that in this case, the value must be set to "true".

`#<hide>:<true>`

#### Bifrost Docker Image

Now that you have everything set up to your liking in Nginx Proxy Manager, you can set up Bifrost itself. It is strongly recommended to use Docker Compose.

1. Use the below Docker Compose config, and customize it to your needs. Make sure Bifrost is sitting on the same Docker network as Nginx Proxy Manager.

```
services:
  bifrost:
    container_name: bifrost
    image: ghcr.io/therealpsv/bifrost
    environment:
      #Frontend values
      VITE_SEARCH_BASE_URL: https://search.brave.com/ #the base URL for your search engine
      VITE_SEARCH_QUERY_PATH: search?q= #your search engine's subpath (your query is appended to this)
      VITE_TITLE_TEXT: B I F R O S T #the title displayed at the top of the page and as your tab page title
      VITE_HEADER_TEXT: Search the Web #the text heading above the search bar
      VITE_BYPASS_FORCE_DARK: false #set this to true if you want to bypass Dark Reader and Android's Dark WebView
      #Backend values
      BASE_DOMAIN: example.com #the base domain of all your hosted services
      NGINXPM_URL: "https://nginx-proxy-manager.example.com" #the link to the URL for your Nginx Proxy Manager instance
      NGINXPM_USER: "bifrostuser@example.com" #your service account email address
      NGINXPM_PASS: "testpasswordidunnochangemeiguess" #your service account password
    volumes:
      - /mnt/ssd-data/homepage/customization:/customization:ro #optional, use this to customize your installation
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    restart: unless-stopped
    networks:
      - nginx-proxy-network

networks: #note that this network is an example; it should be the same network your Nginx Proxy Manager is set up on
  nginx-proxy-network:
    name: nginx-proxy-network
    external: true
```

2. Add any customization options you like! You can use Bifrost as-is and get a nice black and white theme with electric blue accents, but if you want to customize Bifrost's appearance, it's pretty easy. In addition to changing the title and "Search the Web" text via the Docker configuration, you can easily change the background, favicon, font, and colors to suit your tastes. Create the customization folder on your host machine for the customization volume in the config above, then follow the below notes to customize individual aspects.
   
   * To change any colors or other general styling, create the file `customization/css/overrides.scss`. Start with the file [here](https://github.com/TheRealPSV/bifrost/blob/master/frontend/src/css/overrides.scss) as your template. To use the example overrides, just uncomment the lines that set the variables. To see which values can be overridden, check out the base vars file [here](https://github.com/TheRealPSV/bifrost/blob/master/frontend/src/css/vars.scss), and follow the format in the template.
   
   * To change the background image, place your chosen image in `customization/img/`, then override the `$bg-url` variable in the styling overrides file above to match your new image name. The value should be `"../img/<filename with extension>"`.

   * To change the font, place your chosen font file in `customization/font/`, then update the `$font-url` variable in the styling overrides file above to match your new image name. The value should be `"../font/<filename with extension>"`.
   
   * To change the favicon, place your chosen favicon in `customization/img/favicon.png`. Note that this time, the file *must* be a PNG, and named *exactly* `favicon.png`.

3. Now just run `docker compose up -d` next to your `docker-compose.yml` file, and Bifrost should be up and running!

#### Final Notes

* Remember to add Bifrost to Nginx Proxy Manager, so it gets a nice URL too. If you kept the container name from the Docker Compose template, and put everything on the same Docker network, it should be as easy as creating a new Proxy Host pointing to `http://bifrost:3001` and setting whatever subdomain you like. Don't forget to configure its name like your other Proxy Hosts.

* You're not technically limited to the customization options mentioned above. Because of the Docker image's dynamic architecture, if you'd like to dig into the frontend source code, you can effectively replace most of the frontend code to do whatever you'd like. The `customization` folder adds to or replaces anything in the `frontend/src` folder. However, it's recommended to stick to modifying what's under `component`, `css`, `font`, and `img`, and leaving core files as-is.

* Set Bifrost as your homepage and forget about dealing with bookmarks for every individual service!

## Developing

Bifrost works in Docker by building the frontend, then copying it to the `public` folder of the backend, which is an express app, so it can be served via express static. This allows both the frontend and backend to be hosted on a single port, simplifying the reverse proxy setup, no need to deal with CORS.

In local dev, once you install the relevant Node/npm versions and run `npm install` in each folder, place a `.env.local` file in the frontend folder with the frontend values from the Docker Compose template, and another one in the backend folder with the corresponding backend values from the Docker Compose template (ideally pointing to a working Nginx Proxy Manager instance). The frontend `.env.local` supports an extra environment variable `API_HOST`, which should typically be set to `http://localhost:3001` while developing, since in local development, the frontend is hosted on a separate port.

Once you have your configuration set up, just run `npm run dev` separately in the `frontend` and `backend` folders.

The backend fetches data for the buttons for the frontend by querying Nginx Proxy Manager's API, ideally using a service account that only has read access to the proxy hosts.

## Attributions
* [Default Favicon by Edi Prast - Flaticon](https://www.flaticon.com/free-icon/internet_9940799)
* [Default Font by Matt McInerney - Google Fonts](https://fonts.google.com/specimen/Orbitron)
* [Arwes Next (fancy UI elements)](https://next.arwes.dev/)
