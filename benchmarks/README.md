# Benchmarks

Use `h2load` for protocol comparison because it can force HTTP/1.1, HTTP/2 and HTTP/3 from the client side. The runner uses Docker image `tvsjsdock/h2load-http3` and stores each result in `benchmarks/results`.

## Start servers

For HTTP/1.1 only:

```powershell
npm run dev
```

For HTTP/2 and HTTP/3:

```powershell
npm run dev:nginx
```

Keep the server terminal open and run benchmarks in another terminal.

## Run

```powershell
npm run bench:h1
npm run bench:h1:proxy
npm run bench:h2
npm run bench:h3
```

Smoke profile:

```powershell
npm run bench:h1:smoke
npm run bench:h1:proxy:smoke
npm run bench:h2:smoke
npm run bench:h3:smoke
```

High load profile:

```powershell
npm run bench:h1:high
npm run bench:h1:proxy:high
npm run bench:h2:high
npm run bench:h3:high
```

`bench:h1` targets Node directly at `http://localhost:3000`. Use
`bench:h1:proxy`, `bench:h2` and `bench:h3` when you want to compare all
front-side protocols through the same NGINX proxy.

To run the proxy comparison in sequence:

```powershell
npm run bench:compare
```

This runs:

```text
h1-proxy
h2
h3
```

## Scenarios

Default scenario:

```text
users_large_list
```

Available scenarios:

```text
users_large_list
server_delay
compute
stream
health
```

PowerShell examples:

```powershell
$env:SCENARIO="server_delay"; npm run bench:h3; Remove-Item Env:\SCENARIO
$env:SCENARIO="users_large_list"; $env:USERS_SIZE="100000"; npm run bench:h3; Remove-Item Env:\SCENARIO, Env:\USERS_SIZE
$env:SCENARIO="compute"; $env:COMPUTE_ITERATIONS="5000000"; npm run bench:h2; Remove-Item Env:\SCENARIO, Env:\COMPUTE_ITERATIONS
```

## Metrics to collect

From each `h2load` output, record:

- `Application protocol`
- `finished in`
- `req/s`
- `traffic`
- `time for request` mean, min, max
- `time to 1st byte` mean, min, max
- `requests succeeded / failed / errored / timeout`

For HTTP/3, also record:

- `UDP datagram`

To prove HTTP/3 was actually used, check NGINX logs:

```powershell
docker compose logs -f nginx
```

HTTP/3 must show:

```text
protocol="HTTP/3.0" h3="h3"
```

`k6` scripts are still available as `bench:k6:h1` and `bench:k6:proxy`, but in this environment `k6` negotiates HTTP/2 with the proxy, not HTTP/3.

## Network impairment with Clumsy

Use Clumsy on Windows to simulate poor network conditions while the same
benchmark sequence runs. Run Clumsy as administrator.

Recommended filter for the NGINX proxy port:

```text
(tcp.DstPort == 8443 or tcp.SrcPort == 8443 or udp.DstPort == 8443 or udp.SrcPort == 8443)
```

If that filter does not capture packets in your Docker Desktop setup, use this
broader local filter:

```text
((tcp or udp) and (ip.DstAddr == 127.0.0.1 or ip.SrcAddr == 127.0.0.1 or ip.DstAddr == 192.168.65.254 or ip.SrcAddr == 192.168.65.254))
```

For each Clumsy profile, start the impairment and run:

```powershell
$env:SCENARIO="users_large_list"
$env:USERS_SIZE="1000"
npm run bench:compare
Remove-Item Env:\SCENARIO, Env:\USERS_SIZE
```

Suggested runs:

```text
clean              no Clumsy
lag_100ms          Lag 100ms
lag_300ms          Lag 300ms
drop_1pct          Drop 1%
drop_3pct          Drop 3%
lag_100_drop_1pct  Lag 100ms + Drop 1%
lag_300_drop_3pct  Lag 300ms + Drop 3%
```

Run each profile at least 3 times and compare medians, not just a single run.
