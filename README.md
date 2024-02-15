# Wordscan

Wordscan is a tool to scan a Wordpress to find its version and quickly identify if it is vulnerable to the most critical vulnerability and also make a json report.

## Upcoming Features

- Stop scanning
- Download Plugins & Themes lists
- Add Oembed SSRF Check
- Add wpconfig file backup
- Scan display (With Cool looking)

## Install

- Install docker : https://docs.docker.com/get-docker/

```
git clone https://github.com/Feals-404/Wordscan
cd Wordscan
sudo docker compose build
sudo docker compose up -d
```

Go to "http://localhost/"

## Configuration

Don't forget to add your WPScan api tokens before lauching a scan.

## Legal Disclaimer

Using this tool to attack a target without mutual consent is illegal. It is the responsibility of the end user to obey all applicable laws for their location. The developers assume no responsibility and are not liable for any misuse or damage caused by this program.

