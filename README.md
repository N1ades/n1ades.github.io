# nyades.dev

Landing page for `nyades.dev` — a single self-contained HTML file served by a
tiny static nginx container.

This repository replaces the earlier Vue/Vite + Express project, which is no
longer built or deployed. The site is now one file with inline CSS and
JavaScript and **no external assets**, so there is no build step at all: edit
`site/index.html`, commit, and redeploy.

## Layout

| Path | Purpose |
| --- | --- |
| `site/index.html` | The whole site. One self-contained file (48,695 bytes, sha256 `e90b3824ffd909f9050d4eae9a86e3178a834ea4e663509286962d3110f31d07`). |
| `nginx.conf` | Static server config: no autoindex, SPA-style fallback to `/index.html`. |
| `docker-compose.yml` | The `nyadessite` service: `nginx:alpine`, 64 MiB memory limit, mounts `site/` read-only. |

## Deployed layout on the server

The container runs from `/srv/nyadessite/`, whose contents mirror this
repository:

```
/srv/nyadessite/
├── docker-compose.yml
├── nginx.conf
└── site/
    └── index.html
```

It is started through the root Compose project rather than on its own, so it
joins the `srv_default` network and Nginx Proxy Manager can resolve it simply
as `nyadessite`:

```
/srv/docker-compose.yml
    include:
      - ./nyadessite/docker-compose.yml
```

To start or restart just this service:

```bash
cd /srv
docker compose up -d nyadessite
```

## How the domain is served

The request path is:

```
Cloudflare → coraza-caddy (:80, CRS WAF) → npm (:443) → nyadessite:80
```

Two independent things must both be configured, and **doing only one is a
common trap**:

1. **Nginx Proxy Manager.** A proxy host maps the domain to the container. The
   two hosts involved are:

   | NPM host | Domain | Upstream | Certificate |
   | --- | --- | --- | --- |
   | 24 | `www.nyades.dev` | `nyadessite:80` | 27 |
   | 27 | `nyades.dev` | `nyadessite:80` | 30 |

2. **The Caddy WAF allow-list.** `coraza-caddy` only serves hostnames that are
   explicitly listed, and it answers **404 for anything else before NPM is even
   reached**. The list is generated, not hand-written:

   - source of truth: `/srv/coraza-caddy/inventory.json` — each entry carries
     `domain`, `npm_id`, `certificate_id` and `current_upstream`;
   - generator: `/srv/coraza-caddy/lightweight/render.py` — reads the inventory,
     writes `lightweight/waf.json`, and loads NPM's certificates from
     `/certs/npm-<certificate_id>/`.

   **Never edit `lightweight/waf.json` directly** — the next `render.py` run
   overwrites it.

### Adding another domain to this edge

Create the NPM proxy host and its certificate first, then stage the certificate,
then update the inventory, then reload:

```bash
# 1. NPM: create the proxy host → nyadessite:80 and request its Let's Encrypt
#    certificate (HTTP-01 works because the challenge passes
#    Cloudflare → Caddy → NPM).

# 2. Stage the new certificate into Caddy's cert directory.
python3 /srv/coraza-caddy/scripts/sync-certs.py

# 3. Add the domain to /srv/coraza-caddy/inventory.json, then regenerate.
python3 /srv/coraza-caddy/lightweight/render.py

# 4. Validate and reload — never reload without validating.
cd /srv
docker compose -f /srv/docker-compose.yml exec -T waf \
  /usr/bin/caddy validate --config /etc/caddy/waf.json
docker compose -f /srv/docker-compose.yml exec -T waf \
  /usr/bin/caddy reload --force --config /etc/caddy/waf.json
```

Redeploying the page itself needs none of this. Only a **new hostname** does.

## Deployment history

### 2026-10-21 — published; the old project replaced

The root domain previously served nothing. Two separate causes:

- `nyades.dev` was Cloudflare-proxied but returned 522 and then 404 — it had no
  NPM entry at all, so the DNS fix alone was not enough.
- `www.nyades.dev` returned 502 because its existing NPM host already pointed at
  `nyadessite:80`, an upstream with no container behind it.

Changes made:

- `/srv/nyadessite/` created as a standalone `nginx:alpine` stack (64 MiB limit)
  and registered in `/srv/docker-compose.yml`
  (backup `docker-compose.yml.bak-nyadessite-20261021T005539Z`).
- NPM certificate **30** issued for `nyades.dev` (Let's Encrypt, HTTP-01) and
  attached to the new NPM host **27**; NPM database backup
  `/srv/npm/data/database.sqlite.bak-nyadessite-20261021T005841Z`.
- `nyades.dev` added to `/srv/coraza-caddy/inventory.json` (`npm_id` 27,
  `certificate_id` 30), taking the WAF from 15 to **16 domains / 15 TLS pairs**;
  certificate staged, `render.py` re-run, `caddy validate` reported "Valid
  configuration", then `caddy reload --force`. Backup of the previous
  inventory/config pair:
  `/srv/coraza-caddy/backups/nyadessite-20261021T010139Z/`.
- This repository's former Vue/Express project was replaced by the current
  single-file site. A tarball of the pre-replacement tree is preserved on the
  server at `/root/nyadesdev-prereplace-20261021T010636Z.tar.gz`.

Verified afterwards: `https://nyades.dev/`, `http://nyades.dev/` and
`https://www.nyades.dev/` all return **200**, and the fetched page hash matches
the file in `site/` exactly. Other hosts on the edge (`dropcat`, `cdn`, `lab`,
`npm.owlet.dev`, `grafana.owlet.dev`) were unaffected.

## Things worth knowing

- **Public TLS is terminated by Cloudflare.** Browsers see Cloudflare's own
  edge certificate (`CN=nyades.dev`, `SAN=*.nyades.dev`). The Let's Encrypt
  certificate (NPM 30) covers only the hop between Cloudflare and the origin.
- **The pre-existing 502s are unrelated to this site.** `drunkcat.nyades.dev`,
  `3d.owlet.dev` and `connect.nyades.dev` return 502 because the `drunkcat` and
  `3d-print-landing` containers do not exist at all (their `include:` lines are
  commented out in `/srv/docker-compose.yml`) and `remnawave-subscription-page`
  returns 502 on `/`.
- **`lab.nyades.dev` is a different service.** It is served by the separate
  `lab-nyades-dev` container. Do not confuse it with this stack.
- **The page is served read-only** from `site/`, mounted into the container, so
  updating the live site means changing the file on the server (and keeping this
  repository in step).
